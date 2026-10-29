// Declarative CI/CD pipeline for SmartPathMaker (SALS).
//
// Jenkins credentials this pipeline expects (configure once, in Jenkins > Credentials):
//   dockerhub-creds  - Username/password (or access token) for Docker Hub pushes.
//   deploy-ssh-key   - SSH private key (type "SSH Username with private key",
//                      username "ec2-user") able to reach the proxy EC2 and,
//                      via the app-sg's rule, the app EC2 — Jenkins is inside
//                      the VPC so no bastion hop is needed.
//
// Job parameters (set once when creating the job, from `terraform output` in
// terraform/envs/dev): APP_HOST, PROXY_HOST. See docs/DEPLOYMENT.md.

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    triggers {
        // Primary trigger: GitHub webhook (jenkins-sg already allows 8080 from
        // GitHub's published CIDRs). If webhook delivery proves unreliable,
        // switch this to pollSCM('H/5 * * * *') instead.
        githubPush()
    }

    parameters {
        string(name: 'APP_HOST', defaultValue: '', description: 'App EC2 private IP (terraform output app_private_ip)')
        string(name: 'PROXY_HOST', defaultValue: '', description: 'Proxy EC2 public/Elastic IP (terraform output proxy_public_ip)')
    }

    environment {
        DOCKERHUB_USER = 'gopikumar1'
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate') {
            // Uses throwaway containers for terraform/node so the Jenkins host
            // itself only needs Docker (no terraform/node install required).
            steps {
                sh '''
                    set -e
                    docker compose -f deploy/app/docker-compose.yml config -q
                    docker compose -f deploy/proxy/docker-compose.yml config -q

                    docker run --rm -v "$WORKSPACE/terraform":/tf -w /tf/envs/dev hashicorp/terraform:1.9 fmt -check -recursive ..
                    docker run --rm -v "$WORKSPACE/terraform":/tf -w /tf/envs/dev hashicorp/terraform:1.9 init -backend=false -input=false
                    docker run --rm -v "$WORKSPACE/terraform":/tf -w /tf/envs/dev hashicorp/terraform:1.9 validate

                    docker run --rm -v "$WORKSPACE/frontend-server":/app -w /app node:22-slim sh -c "npm ci && npm run lint" \
                        || echo "frontend lint: non-blocking failure, continuing"
                '''
            }
        }

        stage('Build') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        set -e
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin

                        docker build -t ${DOCKERHUB_USER}/sals-fe:${IMAGE_TAG} frontend-server
                        docker build -t ${DOCKERHUB_USER}/sals-be:${IMAGE_TAG} core-backend-server
                        docker build -t ${DOCKERHUB_USER}/fast-api-backend:${IMAGE_TAG} ai-backend-server
                        docker build -t ${DOCKERHUB_USER}/sals-proxy:${IMAGE_TAG} proxy-server

                        docker push ${DOCKERHUB_USER}/sals-fe:${IMAGE_TAG}
                        docker push ${DOCKERHUB_USER}/sals-be:${IMAGE_TAG}
                        docker push ${DOCKERHUB_USER}/fast-api-backend:${IMAGE_TAG}
                        docker push ${DOCKERHUB_USER}/sals-proxy:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Test') {
            // SalsApplicationTests is a full @SpringBootTest with no mocks, so it
            // needs a real MySQL + Mongo to load the context. Throwaway containers
            // on Jenkins' own Docker daemon, torn down afterwards either way —
            // zero application code changes needed.
            steps {
                sh '''
                    set -e
                    NET="sals-test-${BUILD_NUMBER}"
                    docker network create "$NET"

                    docker run -d --name sals-test-mysql-${BUILD_NUMBER} --network "$NET" \
                        -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=sals \
                        -e MYSQL_USER=sals -e MYSQL_PASSWORD=sals mysql:8.4
                    docker run -d --name sals-test-mongo-${BUILD_NUMBER} --network "$NET" \
                        -e MONGO_INITDB_ROOT_USERNAME=sals -e MONGO_INITDB_ROOT_PASSWORD=sals mongo:7

                    for i in $(seq 1 30); do
                        docker exec sals-test-mysql-${BUILD_NUMBER} mysqladmin ping -h 127.0.0.1 -uroot -proot --silent && break
                        sleep 2
                    done

                    docker run --rm --network "$NET" \
                        -v "$WORKSPACE/core-backend-server":/app -w /app \
                        -e SPRING_DATASOURCE_URL="jdbc:mysql://sals-test-mysql-${BUILD_NUMBER}:3306/sals?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC" \
                        -e SPRING_DATASOURCE_USERNAME=sals \
                        -e SPRING_DATASOURCE_PASSWORD=sals \
                        -e SPRING_DATA_MONGODB_URI="mongodb://sals:sals@sals-test-mongo-${BUILD_NUMBER}:27017/sals?authSource=admin" \
                        -e GEMINI_API_KEY=test-key-not-for-prod \
                        -e APP_JWT_SECRET=test-jwt-secret-at-least-32-bytes-long \
                        -e SPRING_MAIL_USERNAME=test@example.com \
                        -e SPRING_MAIL_PASSWORD=test \
                        maven:3.9-eclipse-temurin-21 mvn -B test
                '''
            }
            post {
                always {
                    sh '''
                        docker rm -f sals-test-mysql-${BUILD_NUMBER} sals-test-mongo-${BUILD_NUMBER} 2>/dev/null || true
                        docker network rm sals-test-${BUILD_NUMBER} 2>/dev/null || true
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: ['deploy-ssh-key']) {
                    sh '''
                        set -e

                        ssh -o StrictHostKeyChecking=no ec2-user@${PROXY_HOST} "mkdir -p /opt/sals-proxy"
                        scp -o StrictHostKeyChecking=no deploy/proxy/docker-compose.yml ec2-user@${PROXY_HOST}:/opt/sals-proxy/docker-compose.yml
                        ssh -o StrictHostKeyChecking=no ec2-user@${PROXY_HOST} \
                            "cd /opt/sals-proxy && DOCKERHUB_USER=${DOCKERHUB_USER} IMAGE_TAG=${IMAGE_TAG} APP_HOST=${APP_HOST} PUBLIC_IP=${PROXY_HOST} docker compose pull && DOCKERHUB_USER=${DOCKERHUB_USER} IMAGE_TAG=${IMAGE_TAG} APP_HOST=${APP_HOST} PUBLIC_IP=${PROXY_HOST} docker compose up -d"

                        ssh -o StrictHostKeyChecking=no ec2-user@${APP_HOST} "mkdir -p /opt/sals"
                        scp -o StrictHostKeyChecking=no deploy/app/docker-compose.yml ec2-user@${APP_HOST}:/opt/sals/docker-compose.yml
                        scp -o StrictHostKeyChecking=no deploy/app/fetch-secrets.sh ec2-user@${APP_HOST}:/opt/sals/fetch-secrets.sh
                        ssh -o StrictHostKeyChecking=no ec2-user@${APP_HOST} "chmod +x /opt/sals/fetch-secrets.sh && sudo /opt/sals/fetch-secrets.sh"
                        ssh -o StrictHostKeyChecking=no ec2-user@${APP_HOST} \
                            "cd /opt/sals && DOCKERHUB_USER=${DOCKERHUB_USER} IMAGE_TAG=${IMAGE_TAG} docker compose pull && DOCKERHUB_USER=${DOCKERHUB_USER} IMAGE_TAG=${IMAGE_TAG} docker compose up -d"
                    '''
                }
            }
        }

        stage('Verify') {
            steps {
                script {
                    def healthy = false
                    for (int i = 0; i < 15; i++) {
                        def code = sh(script: "curl -s -o /dev/null -w '%{http_code}' -k https://${params.PROXY_HOST}/healthz || true", returnStdout: true).trim()
                        if (code == '200') {
                            healthy = true
                            break
                        }
                        sleep(time: 10, unit: 'SECONDS')
                    }
                    if (!healthy) {
                        error('Health check did not return 200 after deploy')
                    }
                }
            }
        }
    }

    post {
        // On any failed stage (most importantly a failed Verify), redeploy the
        // last known-good IMAGE_TAG to both EC2s so a bad build doesn't stay live.
        failure {
            script {
                def previousTag = currentBuild.previousSuccessfulBuild?.number
                if (previousTag) {
                    echo "Rolling back app + proxy EC2 to IMAGE_TAG=${previousTag}"
                    sshagent(credentials: ['deploy-ssh-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ec2-user@${params.APP_HOST} \
                                "cd /opt/sals && DOCKERHUB_USER=${env.DOCKERHUB_USER} IMAGE_TAG=${previousTag} docker compose up -d" || true
                            ssh -o StrictHostKeyChecking=no ec2-user@${params.PROXY_HOST} \
                                "cd /opt/sals-proxy && DOCKERHUB_USER=${env.DOCKERHUB_USER} IMAGE_TAG=${previousTag} APP_HOST=${params.APP_HOST} PUBLIC_IP=${params.PROXY_HOST} docker compose up -d" || true
                        """
                    }
                } else {
                    echo 'No previous successful build to roll back to.'
                }
            }
        }
    }
}

# ---------- Stage 1: build the Vite app ----------
# node:slim (glibc) matches the environment Vercel built in; alpine (musl) can
# break Vite 8 / rolldown native bindings when the lockfile came from Windows.
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# EMPTY on purpose: the frontend then calls relative URLs (/api/...) and the
# reverse proxy routes them to Spring. It must be defined (even as ""), otherwise
# `${import.meta.env.VITE_SPRING_BACKEND_URL}/api/...` becomes "undefined/api/...".
ARG VITE_SPRING_BACKEND_URL=""
ENV VITE_SPRING_BACKEND_URL=$VITE_SPRING_BACKEND_URL

RUN npm run build

# ---------- Stage 2: static server ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

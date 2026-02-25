import face_recognition

image = face_recognition.load_image_file("known_faces/12321662.jpg")
faces = face_recognition.face_locations(image)

print("Faces detected:", len(faces))
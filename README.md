# Quiz-Hub
### Live Here ➡️ https://quiz-hub-by-subrata-rudra.vercel.app/
## TECH STACK USED:
### BACKEND:
NODE JS, EXPRESS JS
### FRONTEND:
REACT JS
### DATABASE:
MONGODB
## Requirements
You should have Node JS installed in your device.
## Set Up
1) Clone the repository by using this command ➡️ git clone https://github.com/Subrata-Rudra/Quiz-Hub
2) Open terminal in that folder.
3) In the terminal run ➡️ cd backend
4) Now run ➡️ npm install
5) Now run ➡️ cd ../
6) Now run ➡️ cd frontend
7) Now run ➡️ npm install
8) Now exit from terminal. Now, you are all set up to run the app on your device.
## Run Locally
1) Open the folder in VS Code.
2) Create a new file named ".env".
3) Now write a line in .env file MONGO_URI = URL_OF_YOUR_MONGODB_CLUSTER
4) Now write another line in .env file JWT_SECRET = <YOUR_PRIVATE_JWT_SECRET>
5) Open terminal in the folder.
6) Run ➡️ cd backend
4) Run ➡️ npm run start
6) The backend will run on ➡️ PORT(5000)
7) Now, open another new terminal in the same folder.
8) Now run ➡️ cd frontend
9) Now run ➡️ npm start
10) Frontend will run on ➡️ PORT(3000)
11) Open http://localhost:3000 in your browser, you will see that the website is live 🎉.
12) 
## To access the backend without setting up the backend locally
BACKEND HOSTED LIVE LINK ➡️ https://quiz-hub-backend.onrender.com/


npx react-scripts start 

{
    "_id": "69389f6a5894835c02d8f56e",
    "name": "ahlem1",
    "email": "ahlem1@gmail.com",
    "isTeacher": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Mzg5ZjZhNTg5NDgzNWMwMmQ4ZjU2ZSIsImlhdCI6MTc2NjQzMDA4NiwiZXhwIjoxNzY5MDIyMDg2fQ.6qHNYb7ldr1nM1ttkUkMtCpfNtwD-SeyOeA5uJMD6tk"
}


{
    "_id": "6949a3b7f95a0429713297f4",
    "name": "wiem2",
    "email": "wiem2@example.com",
    "isTeacher": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDlhM2I3Zjk1YTA0Mjk3MTMyOTdmNCIsImlhdCI6MTc2NjQzMzcxOSwiZXhwIjoxNzY5MDI1NzE5fQ.fnrC-rHdl9G1W0vAhO1Aty3oaNEE3x5Ee-zgHQjVE54"
}

[
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما هي سرعة القيادة القصوى داخل المدينة؟",
    "option1": "50 كم/س",
    "option2": "70 كم/س",
    "option3": "90 كم/س",
    "option4": "110 كم/س",
    "correct_answer": "0",
    "image": "/uploads/1.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما معنى إشارة STOP؟",
    "option1": "توقف مؤقت",
    "option2": "توقف كامل",
    "option3": "استمر بحذر",
    "option4": "أعطِ الأولوية فقط",
    "correct_answer": "1",
    "image": "/uploads/2.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "عند رؤية إشارة التحذير (مثلث أصفر)، يجب عليك:",
    "option1": "زيادة السرعة",
    "option2": "التوقف فوراً",
    "option3": "القيادة بحذر",
    "option4": "تجاهل الإشارة",
    "correct_answer": "2",
    "image": "/uploads/3.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما هو لون خطوط الممرات في الطريق السريع؟",
    "option1": "أبيض",
    "option2": "أحمر",
    "option3": "أصفر",
    "option4": "أزرق",
    "correct_answer": "0",
    "image": "/uploads/4.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما هي علامة المرور التي تعني 'ممنوع الدوران'؟",
    "option1": "مستطيل أحمر",
    "option2": "دائرة حمراء بداخلها سهم معكوس",
    "option3": "مثلث أصفر",
    "option4": "مربع أخضر",
    "correct_answer": "1",
    "image": "/uploads/5.png"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "عند الاقتراب من معبر المشاة، يجب عليك:",
    "option1": "الاستمرار دون تغيير السرعة",
    "option2": "التوقف للسماح للمشاة بالعبور",
    "option3": "زيادة السرعة",
    "option4": "تجاوز المشاة بحذر",
    "correct_answer": "1",
    "image": "/uploads/6.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما معنى الخط الأصفر المتقطع على الطريق؟",
    "option1": "ممنوع التجاوز",
    "option2": "يمكن التجاوز إذا كان الطريق خالياً",
    "option3": "خط تحذيري",
    "option4": "ممنوع الوقوف",
    "correct_answer": "1",
    "image": "/uploads/7.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "ما هي الإشارة التي تعني 'حق الأولوية للطريق المقابل'؟",
    "option1": "مثلث أحمر",
    "option2": "مربع أزرق",
    "option3": "دائرة حمراء",
    "option4": "مستطيل أبيض",
    "correct_answer": "0",
    "image": "/uploads/8.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "arabic",
    "category": "Code de la route",
    "desc": "عند القيادة في طقس ماطر، يجب عليك:",
    "option1": "زيادة السرعة",
    "option2": "الحفاظ على مسافة أكبر بين المركبات",
    "option3": "تجاوز السيارات بسرعة",
    "option4": "تجاهل الطريق",
    "correct_answer": "1",
    "image": "/uploads/9.jpg"
  },
  {
    "uid": "69389f6a5894835c02d8f56e",
    "lang_id": "ar",
    "category": "Code de la route",
    "desc": "ما هو الحد الأقصى للسرعة على الطرق الريفية؟",
    "option1": "50 كم/س",
    "option2": "70 كم/س",
    "option3": "90 كم/س",
    "option4": "120 كم/س",
    "correct_answer": "2",
    "image": "/uploads/10.jpeg"
  }
]

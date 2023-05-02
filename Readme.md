# BudgetBonsai

## About

This is my final exam project for Codecool's Junior Fullstack API Developer course. It's a fullstack expense and income tracker web application, in which - after logging in with Google - you can add, see, modify and delete transactions, and also see statistics. This repository is for the backend server of the app. Without this, the frontend won't work.

## Instructions:

1. Run `npm install` in the root directory
2. Set environment variables:
   - Create a `.env` file in the root directory
   - Paste the following lines into the file:
     ```
      PORT=<port>
      MONGODB_URI=_<Your MongoDB URI>_
      GOOGLE_CLIENT_ID=570549999643-v2v38o9f648bi092dnbo4qigqp02sb4k.apps.googleusercontent.com
      GOOGLE_CLIENT_SECRET=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
      JWT_SECRET=<Your secret key>
      REDIRECT_URI=http://localhost:5173/finishlogin
     ```
     _Note: You can modify the `PORT`, however you need to be consistent with the backend port number specified in the frontend's `.env` file._

3. For the development server, run `npm run dev`.
   __Important: You'll probably have to stop the dev server and start it again after running it first, because the `dist` folder is not yet existent at the first run.__
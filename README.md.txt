# Healthcare Portal

This is a simple React application for a healthcare portal with user authentication and an admin dashboard.

## Features

* User Login (Username/Password)
* Patient Portal (Placeholder)
* Physician/Provider Dashboard (Placeholder)
* Sales & Marketing Dashboard (Placeholder)
* Admin Dashboard with entity-based access
* Dynamic Financial and Monthly Bonus reports for admins (Placeholder content)

## Setup Locally

1.  **Clone the repository:**
    `git clone <your-repo-url>`
2.  **Navigate to the project directory:**
    `cd my-healthcare-app`
3.  **Install dependencies:**
    `npm install`  <-- **Important: Run this step locally to generate package-lock.json**
4.  **Commit `package-lock.json` and push to GitHub.**
5.  **Start the development server:**
    `npm start`

The application will be accessible at `http://localhost:3000`.

## Deployment on Render

This application can be deployed on Render.

1.  **Create a new, empty repository on GitHub first.** Do not initialize it with a README.md, .gitignore, or license.
2.  Create a new "Static Site" on Render OR a "Web Service" if a Start Command is required.
3.  Connect your GitHub repository.
4.  Configure the **Build Command**: `npm ci && npm run build`
5.  Set the **Publish Directory**: `build`
6.  If a **Start Command** is required (e.g., for a Web Service, which serves static files): `npx serve -s build`
7.  Deploy!

## Admin User Credentials (Example)

* **Username:** `SatishD`
* **Password:** `password123`

(You can find other admin usernames and their permissions inside `src/App.js` in the `users` array.)


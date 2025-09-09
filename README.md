API Rate Limiter Dashboard
A full-stack web application that provides a real-time, interactive dashboard for visualizing the Token Bucket algorithm, a common and effective method for API rate limiting.

📖 Project Motivation
In modern web services, APIs are valuable resources that can be susceptible to abuse, whether through malicious attacks like DDoS, or simply from buggy client-side code causing unintentional request spam. Unchecked, this can lead to server overload, degraded performance for legitimate users, and increased operational costs.

This project was built to explore and demonstrate a robust solution to this problem: rate limiting. It provides a hands-on, visual tool to understand how the Token Bucket algorithm works, making a complex distributed systems concept tangible and interactive.

🌟 Key Features
Real-Time Monitoring: View successful and blocked API requests as they happen with a live-updating line chart and event log.

Interactive Visualizations: Analyze traffic patterns with a dynamic activity heatmap and filterable data displays for various time ranges (60 mins, 24 hours, 7 days, 30 days).

Dynamic Configuration: Update the core parameters of the Token Bucket algorithm (Bucket Size and Refill Rate) in real-time and see the effects instantly on the system's behavior.

Traffic Simulation: A built-in traffic simulator to demonstrate the rate limiter's behavior under heavy load and test different configurations.

Data Persistence: All application state is saved to the browser's localStorage, ensuring a seamless user experience across sessions.

Responsive Design: A clean, modern UI that is fully responsive and functional on both desktop and mobile devices.

🧠 How It Works: The Token Bucket Algorithm
This application uses a custom-built middleware on the backend that implements the Token Bucket algorithm using Redis.

The Bucket: Each unique user (identified by IP address) is assigned a "bucket" that can hold a certain number of tokens (the Bucket Size).

The Refill: Tokens are added to the bucket at a constant, fixed rate (the Refill Rate).

The Request: When a user makes an API request, the system checks if their bucket has at least one token.

If YES, one token is removed from the bucket, and the request is allowed to proceed.

If NO, the request is blocked with a 429 Too Many Requests error, and the user must wait for their bucket to be refilled.

This approach is highly effective because it allows for short bursts of traffic (up to the bucket size) while enforcing a sustainable average request rate over time.

🛠️ Tech Stack
This project is a full-stack application built with a modern, scalable technology set.

Frontend:

Framework: React (with Hooks & useCallback for performance)

Build Tool: Vite

Styling: Tailwind CSS

Charting: Recharts

Icons: Lucide React

Backend:

Runtime: Node.js

Framework: Express.js

Database: Redis (for high-performance, real-time data storage)

Middleware: Custom-built middleware for the Token Bucket algorithm.

Deployment:

Platform: Vercel (Frontend) & Render (Backend)

CI/CD: Integrated with GitHub for automatic deployments on push.

🚀 Running the Project Locally
To set up and run this project on your local machine, follow these steps.

Prerequisites
Node.js (v18 or later)

npm

A running Redis instance on localhost:6379

Setup and Execution
Clone the repository:

git clone [https://github.com/anisha-singhal/API-RATE-LIMITER.git](https://github.com/anisha-singhal/API-RATE-LIMITER.git)
cd API-RATE-LIMITER

Install Backend Dependencies:

cd rate-limiter-backend
npm install

Install Frontend Dependencies:

cd ../rate-limiter-frontend
npm install

Set Up Environment Variables:

In the rate-limiter-frontend directory, create a new file named .env.

Add the following line to it. This tells your local frontend where to find your local backend.

VITE_API_BASE_URL=http://localhost:8000

Run the Application:

Terminal 1 (Backend): Navigate to rate-limiter-backend and run:

npm start

Terminal 2 (Frontend): Navigate to rate-limiter-frontend and run:

npm run dev

The application will be available at https://api-rate-limiter-eight.vercel.app/

🌱 Future Improvements
This project is a solid foundation, and here are a few ideas for future enhancements:

Real-time Chart Updates: Implement WebSockets to push data from the server to the client, allowing the chart to update in real-time without user interaction.

Data-Driven Heatmap: Connect the activity heatmap to the actual historical request data instead of using placeholder logic.

User Authentication: Add user accounts so that different users can have their own rate-limiting rules and view their personal API usage history.

📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

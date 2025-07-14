 ## School Bus Route Optimization

An intelligent web-based system that optimizes school bus routes in real time based on student attendance and location, aiming to reduce fuel usage and travel time.

## About The Project

This project is a route optimization system designed for school buses. It gathers attendance and location data from students to compute the most efficient path for the driver. The system ensures that only students who confirm bus usage are included in the route, resulting in reduced travel time and fuel consumption.

##Key Features:

- Separate panels for Admin, Student, and Driver
- Students provide live location during registration
- Optimized routes generated using Neighborhood Search and Two-Opt algorithm
- Interactive map available to drivers for navigation
- Admin dashboard to track student attendance history
- Secure login-based access for all roles

##  Built With

- **Frontend**: HTML, CSS, JavaScript  
- **Mapping**: Leaflet.js, OSRM  
- **Optimization Algorithms**: Neighborhood Search, Two-Opt  
- **Database**: Firebase  
- **Hosting**: Netlify

## Prerequisites

To run this project locally, ensure you have the following:

- Web browser (Chrome recommended)
- Firebase project (API keys for setup)
- Netlify CLI (if deploying)

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/shashank-kulkarni03/school-bus-route-optimization.git

2. Open the project in a code editor and configure Firebase in firebase-config.js:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  ...
};

3. Launch with a live server or deploy via Netlify.

##Usage
- Students register and provide location details.
- Admin logs in to manage attendance and view usage history.
- Drivers log in to access the optimized map-based routes for pickups.
- Routes are generated based on students who mark themselves as "Coming via Bus".

##Sample Folder Structure:
/public
├── index.html
├── login.html / login.js
├── register.html / register.js
├── admin.html / admin.js
├── driver.html / driver.js
├── student.html
├── script.js
├── style.css
├── firebase-config.js
├── lrm-openrouteservice.js
├── netlify.toml

##Roadmap
 - Implement live student location on map
 - Optimize routes using Two-Opt and Neighborhood Search
 - Role-based authentication system

##Contact

**Shashank Kulkarni**  
 shashankkulkarniofficial@gmail.com  
 [GitHub Profile](https://github.com/shashank-kulkarni03)

##Acknowledgments

- [Leaflet.js](https://leafletjs.com/) — Interactive maps  
- [Open Source Routing Machine (OSRM)](http://project-osrm.org/)  
- [Firebase](https://firebase.google.com/) — Authentication & database  
- [Netlify](https://www.netlify.com/) — Deployment  

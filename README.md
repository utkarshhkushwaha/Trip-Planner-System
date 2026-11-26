
# Wayfarer — Trip Planner System

A simple front-end mini project built with **HTML, CSS and vanilla JavaScript**.

## Team Members

| S. No. | Team Member Name | GitHub ID |
|---|---|---|
| 1 | Umme Eiman | uesaifee-cyber |
| 2 | Unnati Agrawal | Unnati-core |
| 3 | Urvi Gupta | UrviCoder16 |
| 4 | Utkarsh Gupta | utkarsh21gupta08-cmd |
| 5 | Utkarsh Kushwaha | utkarshhkushwaha |

## Run the project
1. Extract `trip-planner-system.zip`.
2. Open the folder in VS Code.
3. Open `index.html` in your browser (or use the VS Code Live Server extension).

## Demo login
- Choose **Traveller** to create and view itineraries.
- Choose **Admin / Partner** to view all trip plans and the dashboard summary.
- Enter any name, email and password. This is a demonstration login; it does not authenticate real users.

## Features
- Separate Traveller and Admin / Partner login modes.
- Trip form: destination, dates, number of travellers, budget, travel style, transport and notes.
- Creates a simple day-by-day itinerary draft based on the selected travel style and trip duration.
- Traveller can view and delete their saved itineraries.
- Admin / Partner can see trip requests and summary statistics.
- Uses browser `localStorage` to save demo trip data.

## Important limitation
This is a client-side academic mini project. Login is only a role-based UI demonstration and is **not secure**. Data is stored in the current browser only. For a real multi-user product, add a backend (for example Node.js/Express), a database, password hashing, sessions/JWT and server-side role authorization.

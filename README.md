# 🚁 RescueFusion

### Autonomous AI-Powered Search & Rescue Drone

> **Smart India Hackathon 2026 — Problem Statement 26177**
> **Theme:** Robotics & Drones | **Hardware**
> **Organization:** Qualcomm

RescueFusion is an autonomous disaster-response drone designed to help rescue teams **find survivors, detect hazards, map affected areas, and make safer search decisions** in difficult environments.

The system combines **RGB + thermal vision, onboard AI, sensor fusion, autonomous navigation, mapping, and a command-center dashboard** into a single rescue platform.

---

## 🎯 Problem

During disasters such as earthquakes, floods, landslides, fires, and building collapses, search teams face:

* Dangerous and inaccessible environments
* Limited visibility and poor lighting
* Large areas requiring rapid inspection
* Risk of secondary hazards
* Communication and GPS limitations
* Difficulty locating survivors quickly

RescueFusion aims to reduce responder exposure while improving the speed and reliability of aerial search.

---

## 💡 Our Solution

The drone autonomously explores a disaster-affected area while continuously:

**Sense → Detect → Localize → Map → Plan → Replan → Report**

It uses multiple sensors and AI models to identify people and hazards, estimate their locations, build a map, and dynamically choose safer and more useful search paths.

---

## 🧠 System Architecture

```text
              ┌─────────────────────┐
              │   RGB Camera        │
              │   Thermal Camera    │
              │   IMU / GPS         │
              │   Distance Sensors  │
              └──────────┬──────────┘
                         ↓
                 ┌───────────────┐
                 │ Sensor Fusion │
                 └───────┬───────┘
                         ↓
              ┌─────────────────────┐
              │   Edge AI / YOLO    │
              │ Person + Hazard     │
              │ Detection           │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Localization &      │
              │ Mapping             │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Path Planning &     │
              │ Obstacle Avoidance  │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Rescue Priority &   │
              │ Mission Planning    │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Command Dashboard   │
              └─────────────────────┘
```

---

## 🔍 Key Capabilities

### 👤 Survivor Detection

AI-based detection identifies people from aerial imagery and provides detection information for rescue prioritization.

### 🔥 Hazard Detection

The system is designed to identify hazards such as:

* Fire
* Flooded areas
* Debris / damaged structures
* Exposed electrical infrastructure
* Landslide regions
* Other visually detectable hazards

### 🌡️ RGB + Thermal Fusion

RGB imagery provides visual information while thermal sensing can assist in situations involving:

* Low visibility
* Night operations
* Smoke or obscured environments
* Human heat signatures

### 🗺️ Autonomous Mapping

Detected objects and explored areas can be associated with spatial coordinates to build a useful representation of the disaster zone.

### 🧭 Autonomous Navigation

The drone uses path planning and obstacle avoidance to navigate through the search environment.

Initial planning uses **A***, with dynamic replanning concepts intended for more complex missions.

### 📡 GPS & GPS-Denied Operation

The architecture supports both GPS-assisted navigation and future GPS-denied localization approaches for environments where GNSS is unreliable or unavailable.

### 🚨 Rescue Priority

Detected survivors and hazards can be assigned priorities based on factors such as:

* Victim presence
* Hazard severity
* Location
* Accessibility
* Mission context

### 💻 Command Dashboard

A web-based dashboard provides mission information such as:

* Drone position
* Detected survivors
* Detected hazards
* Search progress
* Mapping information
* Detection logs

---

## ⚙️ Technology Stack

| Area           | Technology                  |
| -------------- | --------------------------- |
| Simulation     | Webots                      |
| AI Detection   | YOLO                        |
| Edge Computing | Raspberry Pi 5 + Hailo-8    |
| Vision         | RGB + Thermal               |
| Navigation     | GPS / IMU / Sensor Fusion   |
| Path Planning  | A*                          |
| Mapping        | Occupancy / Spatial Mapping |
| Dashboard      | Web-based                   |
| Data           | JSON / Local Logging        |

---

## 🧪 Simulation

The initial development and testing environment is **Webots**.

Simulation is used to validate:

* Drone movement
* Coordinates
* Mapping
* Path planning
* Obstacle avoidance
* Camera-based perception
* Detection logging

This allows the autonomy stack to be tested before physical deployment.

---

## 🚀 Mission Workflow

```text
Mission Start
     ↓
Area Exploration
     ↓
Sensor Data Collection
     ↓
AI Detection
     ↓
Survivor / Hazard Localization
     ↓
Map Update
     ↓
Risk & Priority Evaluation
     ↓
Path Replanning
     ↓
Continue Search
     ↓
Mission Report
```

---

## 📊 Project Status

**Current focus:**

* ✅ Webots drone simulation
* ✅ Autonomous movement and coordinates
* ✅ Mapping and path planning concepts
* ✅ A* navigation
* ✅ Obstacle avoidance development
* ✅ Camera / AI perception pipeline
* ✅ Detection logging
* 🔄 RGB + thermal fusion
* 🔄 Advanced GPS-denied navigation
* 🔄 Physical drone integration
* 🔄 Complete command-center integration

> Features marked as 🔄 are under development and are not presented as fully deployed capabilities.

---

## 🛠️ Future Direction

The project will progressively move from simulation toward a deployable rescue platform with:

* Improved GPS-denied navigation
* Robust RGB + thermal fusion
* Advanced autonomous search strategies
* Physical drone testing
* Edge AI deployment
* Improved disaster mapping
* Real-time rescue-team decision support

---

## 🌍 Why RescueFusion?

RescueFusion is designed around one simple objective:

> **Give rescue teams better information, faster — while keeping humans away from unnecessary danger.**

By combining autonomous flight, AI perception, sensor fusion, and intelligent mission planning, the system aims to become a practical aerial assistant for disaster-response operations.

---

## 🏆 Smart India Hackathon 2026

**Problem Statement:** PS26177
**Problem:** Autonomous AI-powered drone for disaster search and rescue
**Category:** Hardware
**Theme:** Robotics & Drones
**Organization:** Qualcomm

---

## 👥 Team Tesla 2

**Team:** Tesla 2
**Project:** RescueFusion
**Institution:** Sushila Devi Bansal College of Technology, Indore
**Smart India Hackathon 2026**

---

## 📜 License

This project is developed for educational, research, and innovation purposes as part of **Smart India Hackathon 2026**.

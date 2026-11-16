# ⚽ E7gzly-Sa3a – Football Club Booking System

**E7gzly-Sa3a** ("Book Me an Hour") is a modern web application designed to streamline the process of reserving football pitches. Instead of calling the club or visiting in person, players and team captains can browse available pitches, check real-time schedules, and book their preferred time slots online.

---

## 📋 Table of Contents
- [Project Idea](#-project-idea)
- [Tech Stack](#-tech-stack)
- [Main Features](#-main-features)
  - [Customer Portal](#1-customer-portal)
  - [Admin Dashboard](#2-admin-dashboard)
- [Booking Workflow & Statuses](#-booking-workflow--statuses)
- [Suggested Database Schema](#-suggested-database-schema)
- [Installation & Setup](#-installation--setup)

---

## 💡 Project Idea

The primary goal of **E7gzly-Sa3a** is to make football pitch reservations faster, easier, and more organized for both players and club management. The platform connects two main user roles:

* **Customers (Players):** Browse pitches, view pricing and capacity, check real-time slot availability, and manage their reservations.
* **Administrators (Club Staff):** Oversee club operations by managing pitches, setting working hours, approving/rejecting requests, and tracking booking analytics.

---

## 🛠 Tech Stack

* **Backend:** Laravel (PHP Framework)
* **Frontend:** HTML5, CSS3, JavaScript (Blade Templates)
* **Database:** MySQL / MariaDB
* **Authentication:** Laravel Breeze  (Role-based access control)

---

## ✨ Main Features

### 1. Customer Portal
* **Authentication:** Secure user registration, login, and profile management.
* **Pitch Discovery:** Browse all active football pitches at the club.
* **Detailed Pitch Views:** Inspect pitch names, high-quality images, hourly rates, and player capacity (e.g., 5v5, 7v7, 11v11).
* **Real-Time Availability:** Interactive date and time-slot checker to prevent double bookings.
* **Seamless Booking:** Reserve a pitch for a specific date and duration in a few clicks.
* **Reservation Management:** View upcoming and past bookings in a personal dashboard.
* **Self-Service Cancellation:** Cancel upcoming reservations if they fall within the club's allowed cancellation window.
* **Live Status Tracking:** Monitor booking progress (`Pending`, `Confirmed`, `Cancelled`, `Completed`).

### 2. Admin Dashboard
* **Secure Admin Access:** Dedicated login portal for club administrators.
* **Analytics Overview:** At-a-glance dashboard displaying key metrics (total bookings, registered customers, active pitches, and revenue).
* **Pitch Management (CRUD):** Add new pitches, update pricing/details, upload images, or deactivate pitches for maintenance.
* **Schedule & Working Hours:** Configure club operating hours and block out unavailable dates or times.
* **Reservation Control:** View all incoming customer bookings with filtering options by date or status.
* **Approval Workflow:** Confirm or reject `Pending` booking requests.
* **Customer Directory:** View and manage registered users and their booking histories.
* **Complete Booking Logs:** Access full historical records of all club reservations.

---

## 🔄 Booking Workflow & Statuses

Every reservation goes through a clear lifecycle:

| Status | Description |
| :--- | :--- |
| 🟡 **Pending** | The customer has submitted a booking request and is awaiting admin confirmation. |
| 🟢 **Confirmed** | The admin has approved the booking, and the time slot is officially locked. |
| 🔴 **Cancelled** | The booking was cancelled by the customer (within policy) or rejected by the admin. |
| 🔵 **Completed** | The match date and time have passed, and the reservation is archived. |

---

## 🗄 Suggested Database Schema

To implement this in Laravel, you will primarily need the following tables:

1. **`users`**: `id`, `name`, `email`, `phone`, `password`, `role` (`customer` | `admin`)
2. **`pitches`**: `id`, `name`, `description`, `capacity`, `price_per_hour`, `image_path`, `is_active`
3. **`bookings`**: `id`, `user_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `total_price`, `status`
4. **`working_hours`** *(Optional)*: `id`, `day_of_week`, `open_time`, `close_time`, `is_closed`

---

## 🚀 Installation & Setup

Follow these steps to run the project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com
   cd e7gzly-sa3a
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Update your `.env` file with your local database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).*

4. **Run Database Migrations**
   ```bash
   php artisan migrate --seed
   ```

5. **Start the Local Development Server**
   ```bash
   php artisan serve
   ```
   Visit `http://127.0.0.1:8000` in your browser.

# SapportLah - Donation-Based Crowdfunding Platform

## Overview

SapportLah is a web-based crowdfunding platform designed to facilitate online donations. The platform allows individuals or organizations to create fundraising campaigns and receive financial support from donors in a transparent and efficient manner.

The system provides a secure environment where donors can browse campaigns, contribute funds, and track their donation history. Campaign creators can manage their fundraising activities and monitor donation progress through an intuitive interface.

This project was developed as a Final Year Project for the Bachelor of Science (Honours) in Information Technology (Financial Technology) at Asia Pacific University (APU).

## Key Features

### Donor Features

- Register account
- Browse active fundraising campaigns
- Donate to campaigns
- Ask campaign creators questions about the campaign
- View donation history
- Print donation receipt
- Mark a campaign as favourite
- Edit profile

### Campaign Creator Features

- Create fundraising campaigns
- Track campaign progress
- Update campaign details and status
- Reply to questions asked by donors
- Post campaign updates
- Download list of donors as CSV file
- Edit profile

### Admin Features

- Generate platform statistics
- Manage featured campaigns
- Update campaign status
- Manage users
- Create admin account
- Manage inquiries submitted through Contact Us form
- Edit profile

## Technologies Used

- Next.js
- TypeScript
- MySQL
- Stripe API
- Resend API
- Cloudinary
- Google Maps API

## Installation

Install all required dependencies:

```
npm install
```

## Environment Configuration

Create a `.env` file in the root directory and add:

```
DATABASE_HOST=localhost
DATABASE_USER=your_database_username
DATABASE_PASSWORD=your_database_password
DATABASE_NAME=your_database_name

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret

RESEND_API_KEY=your_resend_api_key

NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Database Configuration

1. Download [WAMP Server](https://sourceforge.net/projects/wampserver/)
2. Login to _phpMyAdmin_
3. Create database and import [sapportlah_db.sql](https://github.com/yipzq-apu/sapportlah/blob/master/database/sapportlah_db.sql)

### Stripe API

1. Install Stripe libraries:

```
npm install --save stripe @stripe/react-stripe-js @stripe/stripe-js
npm install ethers@latest
```

2. Create sandbox account in [Stripe](https://dashboard.stripe.com/register)
3. To install Stripe CLI on Windows, download the latest zip file from [GitHub](https://github.com/stripe/stripe-cli/releases)
4. Unzip the file and open with command line
5. Run `stripe login` and follow the steps in terminal
6. Forward events to your webhook:

```
stripe listen --forward-to localhost:3000/api/webhook
```

### Cloudinary Configuration

1. Sign up for a free Cloudinary account at https://cloudinary.com/
2. Get your Cloud Name, API Key, and API Secret from your Cloudinary dashboard

### Resend API

1. Go to [Resend.com](https://resend.com/)
2. Sign up and log in
3. Navigate to the **API Keys** tab
4. Click **"Create API Key"**
5. Copy the key and add it to your `.env` file

### Google Maps API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for search functionality)
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

> ℹ️ Note
> Before running the project, always run WAMP server and Stripe webhook

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Technical-Registration

**Google Authentication and Technical registration:**

**/googleOAuth**
Method: GET
Description: Initiate the Google OAuth flow for user authentication.
Callback URL: Handle the Google OAuth callback to retrieve user information from Google and proceed with registration.

**User Registration:**

/register
Method: POST
Description: Register a user with Google-authenticated details.
Body:
{ leader_name: [automatically obtained from Google OAuth], 
leader_email: [automatically obtained from Google OAuth], profile_photo_url: [automatically obtained from Google OAuth], 
team_member_2: { name: [provided by the user], email: [provided by the user], role: "Bid" or "Code" (ask the user) }, 
team_member_3: { name: [provided by the user], email: [provided by the user], role: "Bid" or "Code" (ask the user) }
team_member_4: { name: [provided by the user], email: [provided by the user], role: "Bid" or "Code" (ask the user) }, payment_amount: 20 }
Authentication: Only users authenticated through Google OAuth can access this route.

**Payment Integration:**

/payment
Method: POST
Description: Initiate a payment transaction for 20 Rs.
Body: { amount: 20, currency: "INR", receipt: [receipt_id], payment_capture: 1 }
/payment/callback
Method: POST
Description: Handle the payment callback for successful payment completion.
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
/payment/verify
Method: POST
Description: Verify the payment status using Razorpay API.
Body: { payment_id }

**Email Notifications :**

/sendRegistrationConfirmationEmail
Method: POST
Description: Send a registration confirmation email to the user.
Body: { email_subject, email_content }

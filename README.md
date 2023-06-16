# Ecommerce

Ecommerce API Documentation
This repository contains the documentation for an Ecommerce API. The API provides various endpoints to interact with the Ecommerce system, including user authentication, product management, blog management, category management, brand management, and coupon management.

Base URL
The base URL for all API endpoints is 

https://ecommerce-ozzz.onrender.com/api/v1


Authentication Endpoints
POST /auth/login
Description: Login to the Ecommerce system.

POST /auth/admin-login
Description: Login as an admin to the Ecommerce system.

PUT /auth/edit-user
Description: Update user information.

PUT /auth/update-password
Description: Change user password.

POST /auth/register
Description: Register a new user.

GET /auth/logout
Description: Logout the current user.

GET /auth/refresh
Description: Refresh the authentication token.

GET /auth/getAUser/{id}
Description: Get information about a specific user.

DELETE /auth/deleteUser/{id}
Description: Delete a user.

GET /auth/getUsers
Description: Get a list of all users.

POST /auth/forgot
Description: Initiate the password reset process.

PATCH /auth/reset/{token}
Description: Reset the password using the provided token.

GET /auth/wishlist
Description: Get the user's wishlist.

PUT /auth/save-address
Description: Save a user's address.

POST /auth/cart
Description: Add a product to the user's cart.

GET /auth/cart
Description: Get the user's cart.

DELETE /auth/empty-cart
Description: Delete all items from the user's cart.

POST /auth/apply-coupon
Description: Apply a coupon to the user's cart.

POST /auth/cart/create-order
Description: Create an order from the user's cart.

GET /auth/get-order
Description: Get a list of the user's orders.

PUT /auth/order/update-order/{id}
Description: Update the status of an order.

Product Endpoints
POST /product
Description: Register a new product.

GET /product
Description: Get a list of all products.

GET /product/{id}
Description: Get information about a specific product.

PUT /product/{id}
Description: Update product information.

DELETE /product/{id}
Description: Delete a product.

PUT /product/wishlist
Description: Add a product to the user's wishlist.

PUT /product/rating
Description: Add or update a rating for a product.

PUT /product/upload/{id}
Description: Upload a picture for a product.

Blog Endpoints
POST /blog
Description: Create a new blog post.

GET /blog
Description: Get a list of all blog posts.

PUT /blog/{id}
Description: Update a blog post.

GET /blog/{id}
Description: Get information about a specific blog post.

DELETE /blog/{id}
Description: Delete a blog post.

PUT /blog/likes
Description: Like a blog post.

PUT /blog/dislikes
Description: Dislike a blog post.

PUT /blog/upload/{id}
Description: Upload images for a blog post.

Product Category Endpoints
POST /category
Description: Create a new product category.

GET /category
Description: Get a list of all product categories.

PUT /category/{id}
Description: Update a product category.

DELETE /category/{id}
Description: Delete a product category.

GET /category/{id}
Description: Get information about a specific product category.

Blog Category Endpoints
POST /blogcategory
Description: Create a new blog category.

GET /blogcategory
Description: Get a list of all blog categories.

PUT /blogcategory/{id}
Description: Update a blog category.

GET /blogcategory/{id}
Description: Get information about a specific blog category.

DELETE /blogcategory/{id}
Description: Delete a blog category.

Brand Category Endpoints
POST /brand
Description: Create a new brand.

GET /brand
Description: Get a list of all brands.

PUT /brand/{id}
Description: Update a brand.

GET /brand/{id}
Description: Get information about a specific brand.

DELETE /brand/{id}
Description: Delete a brand.

Coupon Endpoints
POST /coupon
Description: Create a new coupon.

GET /coupon
Description: Get a list of all coupons.

PUT /coupon/{id}
Description: Update a coupon.

DELETE /coupon/{id}
Description: Delete a coupon.

Contributing
If you would like to contribute to the development of this API or report any issues, please create a pull request or submit an issue on the GitHub repository.

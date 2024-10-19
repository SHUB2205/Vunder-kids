#include <iostream>
#include <vector>
#include <string>

using namespace std;

// User Class
class User {
public:
    int id;
    string name;
    string email;

    User(int id, string name, string email) : id(id), name(name), email(email) {}
};

// Product Class
class Product {
public:
    int id;
    string name;
    double price;

    Product(int id, string name, double price) : id(id), name(name), price(price) {}
};

// Order Class
class Order {
public:
    int id;
    User user;
    string status;
    string order_date;
    vector<Product> products; // An order can contain multiple products

    Order(int id, User user, string status, string order_date) : id(id), user(user), status(status), order_date(order_date) {}

    // Method to add a product to the order
    void addProduct(Product product) {
        products.push_back(product);
    }
};

// Payment Class
class Payment {
public:
    int id;
    Order order;
    double amount;
    string payment_date;
    string status;

    Payment(int id, Order order, double amount, string payment_date, string status)
        : id(id), order(order), amount(amount), payment_date(payment_date), status(status) {}
};

// Example usage
int main() {
    // Create a user
    User user1(1, "John Doe", "johndoe@example.com");

    // Create some products
    Product product1(101, "Laptop", 999.99);
    Product product2(102, "Smartphone", 499.99);

    // Create an order
    Order order1(1, user1, "Pending", "2024-10-16");
    order1.addProduct(product1);
    order1.addProduct(product2);

    // Create a payment
    Payment payment1(1, order1, 1499.98, "2024-10-16", "Completed");

    // Output the order details
    cout << "Order ID: " << order1.id << endl;
    cout << "User: " << order1.user.name << endl;
    cout << "Status: " << order1.status << endl;
    cout << "Products in the order:" << endl;
    for (const auto& product : order1.products) {
        cout << "- " << product.name << ": $" << product.price << endl;
    }

    // Output payment details
    cout << "Payment Status: " << payment1.status << endl;
    cout << "Total Amount: $" << payment1.amount << endl;

    return 0;
}

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    // Input binary string
    string binaryString;
    cin >> binaryString;

    // Input worth values
    int n = binaryString.size();
    vector<int> worth(n);
    for (int i = 0; i < n; ++i) {
        cin >> worth[i];
    }

    // Initialize variables
    int totalWorth = 0; // Total worth of removed characters
    vector<int> stack;  // Stack to store indices of valid alternating string

    for (int i = 0; i < n; ++i) {
        // Check if the stack is empty or current character is alternating with the last character in stack
        if (stack.empty() || binaryString[stack.back()] != binaryString[i]) {
            stack.push_back(i); // Add index to stack
        } else {
            // Remove the less worthy character
            if (worth[stack.back()] < worth[i]) {
                totalWorth += worth[stack.back()];
                stack.pop_back(); // Remove the less worthy character
                stack.push_back(i); // Add the current character
            } else {
                totalWorth += worth[i]; // Remove the current character
            }
        }
    }

    // Output the total worth of removed characters
    cout << totalWorth << endl;

    return 0;
}

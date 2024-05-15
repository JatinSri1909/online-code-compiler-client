const stubs = {} ;

stubs.cpp  = `
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!";
    return 0;
}
`;

stubs.py = `
print("Hello, World!")
`;

stubs.c = `
#include <stdio.h>
int main() {
    printf("Hello, World!");
    return 0;
}
`;

export default stubs;
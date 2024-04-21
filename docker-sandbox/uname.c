/* uname.c - Chris Grams - 2024
A simple LD_PRELOAD library to change the output of the uname system call.
This is used for changing the output of the `uname` command in a Docker container.
To compile:
    gcc -shared -fPIC -o fake_uname.so uname.c -ldl
*/
#define _GNU_SOURCE
#include <dlfcn.h>
#include <sys/utsname.h>
#include <stdio.h>
#include <string.h>

static int (*original_uname)(struct utsname *buf) = NULL;

int uname(struct utsname *buf) {
    if (!original_uname) {
        original_uname = dlsym(RTLD_NEXT, "uname"); // Get the original `uname` function.
        if (NULL == original_uname) {
            fprintf(stderr, "Error in `dlsym`: %s\n", dlerror());
            return -1;
        }
    }

    int result = original_uname(buf); // Call the original `uname` function.
    if (result == 0) {
        strcpy(buf->release, "Linux version 5.15-CS568 Mon, 1 Jan 2024 0:00:00 +0000"); // Change the release within the `utsname` struct.
    }
    return result;
}

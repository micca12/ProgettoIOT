// chip custom per simulare rfid su wokwi
#include "wokwi-api.h"
#include <stdint.h>
#include <stdio.h>
#include <unistd.h>

void spi_transfer(uint8_t *data_out, uint8_t *data_in, uint8_t len) {
    printf("MFRC522: Sending data: ");
    for (int i = 0; i < len; i++) {
        printf("0x%02X ", data_out[i]);
    }
    printf("\n");

    for (int i = 0; i < len; i++) {
        data_in[i] = 0xAB;
    }
    printf("MFRC522: Received data: ");
    for (int i = 0; i < len; i++) {
        printf("0x%02X ", data_in[i]);
    }
    printf("\n");
}

void send_uid_to_arduino() {
    for (int i = 0; i < 10; i++) {
        uint8_t uid_data[4] = {0x12, 0x34, 0x56, 0x78};

        printf("UID %d: ", i + 1);
        for (int j = 0; j < 4; j++) {
            printf("%02X ", uid_data[j]);
        }
        printf("\n");

        spi_transfer(uid_data, NULL, 4);

        sleep(1);
    }
}


void chip_init() {
}

int main() {
    chip_init();

    while (1) {
        send_uid_to_arduino();
        sleep(10);
    }

    return 0;
}

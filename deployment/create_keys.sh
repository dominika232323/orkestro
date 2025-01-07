#!/bin/bash
ssh-keygen -m PEM -t rsa -b 4096 -f ~/.ssh/orkestro.pem
chmod 600 ~/.ssh/orkestro.pem

#!/bin/bash
set -f

resource_group='rg13'
location='northeurope'
address='10.0.0.0/16'
priority='Spot' # Regular Spot

# one group + subnet (rules in descending priority), name will be saved as name-nsg and name-net
security_groups=(
#   name      subnet_ip     source_ip_1 destination_port_1 ip2 port2 ...
    "exposed  10.0.255.0/24 $address    *                  *   22    * 5000"
#    "internal 10.0.0.0/18   $address    *                  *   22"
)

public_ip="frontend-ip"
machine_with_ip="frontend"


# VMs to set up; type - to give a VM no public address; 4 first and 1 last address in a subnet are reserved
vms=(
#   name              security_group_name private_ip   public_ip
    "$machine_with_ip exposed             10.0.255.11 $public_ip"
#    "rest             internal            10.0.0.11    -"
)

# scripts to run on VMs (setup_machine master slave backend frontend): vm_name script arg1 arg2 arg3 ...
scripts=(
    "frontend setup_machine"
    "frontend master"
    "frontend backend"
    "frontend frontend"
#    "rest     setup_machine"
)


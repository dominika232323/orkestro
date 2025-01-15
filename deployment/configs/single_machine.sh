#!/bin/bash
set -f

resource_group='rg'
location='northeurope'
address='10.0.0.0/16'
priority='Spot' # Regular Spot

# security groups and their subnets (rules in descending priority), name will be saved as name-nsg and name-net
security_groups=(
#   name      subnet_ip     source_ip_1 destination_port_1 ip2 port2 ...
    "exposed  10.0.255.0/24 $address    *                  *   22    * 5000"
    "internal 10.0.0.0/18   $address    *                  *   22"
)

public_ip="frontend-ip"
machine_with_ip="frontend"


# VMs to set up; type - to give a VM no public address; 4 first and 1 last address in a subnet are reserved
vms=(
#   name              security_group_name private_ip   public_ip
    "$machine_with_ip exposed             10.0.255.11 $public_ip"
    "rest             internal            10.0.0.11    -"
)

# components for VMs (master slave backend frontend)
scripts=(
#   vm_name   component
    "frontend master"
    "rest     slave"
    "frontend backend"
    "frontend frontend"
)


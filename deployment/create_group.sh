#!/bin/bash
set -f
if [ "$#" != "1" ]; then echo "create_group.sh path_to_config"; exit 2; fi
source $1

az group create --name $resource_group --location $location

az network vnet create --name "${resource_group}-vnet" --resource-group $resource_group --address-prefixes $address

az network public-ip create --resource-group $resource_group --name $public_ip --sku Basic

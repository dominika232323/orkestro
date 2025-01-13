#!/bin/bash
set -f
if [ "$#" != "1" ]; then echo "main.sh path_to_config"; exit 2; fi
source $1

az group create --name $resource_group --location $location

az network vnet create --name "${resource_group}-vnet" --resource-group $resource_group --address-prefixes $address

az network public-ip create --resource-group $resource_group --name $public_ip --sku Basic

for ((i = 0; i < ${#security_groups[@]}; i++)); do
	set ${security_groups[$i]} # name subnet_address source_address_1 destination_port_1 addr2 port2 ...
	group_name=$1; shift
	az network nsg create --resource-group $resource_group --name "${group_name}-nsg"
	az network vnet subnet create --resource-group $resource_group --vnet-name "${resource_group}-vnet" --network-security-group "${group_name}-nsg" --name "${group_name}-net" --address-prefixes $1
	shift
	
	while [ $# -ne 0 ]; do
		priority=$(expr $# \* 100)
		az network nsg rule create --resource-group $resource_group --nsg-name "${group_name}-nsg" --name "${group_name}-${priority}" --priority $priority \
			--protocol Tcp --source-address-prefixes $1 --destination-port-ranges $2
		shift; shift
	done
done

for ((i = 0; i < ${#vms[@]}; i++)); do
	set ${vms[$i]} # name security_group_name private_ip public_ip
	
	if [ $4 != '-' ]; then # azure CLI fails to get "" from a variable
	    az vm create --resource-group $resource_group --vnet-name "${resource_group}-vnet" --nsg "${2}-nsg" --subnet "${2}-net" --name $1 \
        	--private-ip-address $3 --public-ip-address $4 --image 'Ubuntu2404' --admin-username azureuser --ssh-key-values ~/.ssh/orkestro.pem.pub

        az vm run-command invoke --resource-group $resource_group --name $1 --command-id RunShellScript \
            --scripts "@./deploy/setup_machine.sh"

        ip="$(az vm show -d --resource-group $resource_group --name $machine_with_ip --query publicIps -o tsv)"
        echo "IP=${ip}" >> ../.env
        cd ../..
        scp -i ~/.ssh/orkestro.pem -o StrictHostKeyChecking=accept-new -rp orkestro azureuser@${ip}:/home/azureuser/
        scp -i ~/.ssh/orkestro.pem ~/.ssh/orkestro.pem azureuser@${ip}:/home/azureuser/.ssh/orkestro.pem
        cd orkestro/deployment
	else
		az vm create --resource-group $resource_group --vnet-name "${resource_group}-vnet" --nsg "${2}-nsg" --subnet "${2}-net" --name $1 \
			--private-ip-address $3 --public-ip-address "" --image 'Ubuntu2404' --admin-username azureuser --ssh-key-values ~/.ssh/orkestro.pem.pub

		az vm run-command invoke --resource-group $resource_group --name $1 --command-id RunShellScript \
		    --scripts "@./deploy/setup_machine.sh"

		az vm run-command invoke --resource-group $resource_group --name $machine_with_ip --command-id RunShellScript \
		    --scripts "scp -i ~/.ssh/orkestro.pem -o StrictHostKeyChecking=accept-new -rp /home/azureuser/orkestro azureuser@${3}:/home/azureuser/" ;;
	fi
done


for ((i = 0; i < ${#scripts[@]}; i++)); do
	set ${scripts[$i]} # vm_name script arg1 arg2 arg3 ...
	vm_name=$1; shift
	script=$1; shift

	case $script in # azure CLI fails to get script path from a variable
	    "frontend") az vm run-command invoke --resource-group $resource_group --name $vm_name --command-id RunShellScript \
	                --scripts "cd /home/azureuser/orkestro && docker compose up orkestro-frontend -d" ;;
		"backend")  az vm run-command invoke --resource-group $resource_group --name $vm_name --command-id RunShellScript \
		            --scripts "cd /home/azureuser/orkestro && docker compose up orkestro-backend -d" ;;
		"master")   az vm run-command invoke --resource-group $resource_group --name $vm_name --command-id RunShellScript \
		            --scripts "./home/azureuser/orkestro/setup_master.sh" ;;
		"slave")    az vm run-command invoke --resource-group $resource_group --name $vm_name --command-id RunShellScript \
		            --scripts "cd /home/azureuser/orkestro && docker compose up orkestro-db-slave-setup ; docker compose down orkestro-db-slave-setup --rmi all docker compose up orkestro-db-slave -d" ;; # --parameters $@
	esac
done

echo
echo "Connect to ${ip}:5000"
echo "ssh -i ~/.ssh/orkestro.pem azureuser@${ip}"

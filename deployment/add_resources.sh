#!/bin/bash
set -f
if [ "$#" != "3" ]; then echo "add_resources.sh path_to_config gitlab_token_name gitlab_token_value"; exit 2; fi
source $1
gitlab_token_name=$2
gitlab_token_value=$3

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
	
	if [ $4 != '-' ]; then
	    az vm create --resource-group $resource_group --vnet-name "${resource_group}-vnet" --nsg "${2}-nsg" --subnet "${2}-net" --name $1 \
        	--private-ip-address $3 --public-ip-address $4 --image 'Ubuntu2404' --admin-username azureuser --ssh-key-values ~/.ssh/orkestro.pem.pub

        az vm run-command invoke --resource-group $resource_group --name $1 --command-id RunShellScript \
            --scripts "@./deploy/setup_machine.sh"
        
        az vm run-command invoke --resource-group $resource_group --name $machine_with_ip --command-id RunShellScript \
		    --scripts "cd /home/azureuser && git clone https://${gitlab_token_name}:${gitlab_token_value}@gitlab-stud.elka.pw.edu.pl/zgromadzeni/orkestro.git && chown -R azureuser orkestro"

        ip="$(az vm show -d --resource-group $resource_group --name $machine_with_ip --query publicIps -o tsv)"
        echo "IP=${ip}" >> ../.env
        
        cd ..
        scp -i ~/.ssh/orkestro.pem -o StrictHostKeyChecking=accept-new ~/.ssh/orkestro.pem azureuser@${ip}:/home/azureuser/.ssh/orkestro.pem
        scp -i ~/.ssh/orkestro.pem .env azureuser@${ip}:/home/azureuser/orkestro/
        scp -i ~/.ssh/orkestro.pem nginx/chain.pem azureuser@${ip}:/home/azureuser/orkestro/nginx/
        scp -i ~/.ssh/orkestro.pem nginx/fullchain.pem azureuser@${ip}:/home/azureuser/orkestro/nginx/
        scp -i ~/.ssh/orkestro.pem nginx/privkey.pem azureuser@${ip}:/home/azureuser/orkestro/nginx/
        cd deployment
        
	else # azure CLI fails to get "" from a variable
		az vm create --resource-group $resource_group --vnet-name "${resource_group}-vnet" --nsg "${2}-nsg" --subnet "${2}-net" --name $1 \
			--private-ip-address $3 --public-ip-address "" --image 'Ubuntu2404' --admin-username azureuser --ssh-key-values ~/.ssh/orkestro.pem.pub

		az vm run-command invoke --resource-group $resource_group --name $1 --command-id RunShellScript \
		    --scripts "@./deploy/setup_machine.sh"
		
		az vm run-command invoke --resource-group $resource_group --name $1 --command-id RunShellScript \
		    --scripts "cd /home/azureuser && git clone https://${gitlab_token_name}:${gitlab_token_value}@gitlab-stud.elka.pw.edu.pl/zgromadzeni/orkestro.git && chown -R azureuser orkestro"

		az vm run-command invoke --resource-group $resource_group --name $machine_with_ip --command-id RunShellScript \
		    --scripts "scp -i /home/azureuser/.ssh/orkestro.pem -o StrictHostKeyChecking=accept-new -rp /home/azureuser/orkestro/.env azureuser@${3}:/home/azureuser/orkestro/"
	fi
done

echo
echo "Connect to ${ip}:5000"
echo "ssh -i ~/.ssh/orkestro.pem azureuser@${ip}"

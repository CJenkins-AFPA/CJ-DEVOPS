
output "public_vm_public_ips" {
  value = {
    for name, pip in azurerm_public_ip.pubip :
    name => pip.ip_address
  }
}

output "private_vm_private_ips" {
  value = {
    for name, nic in azurerm_network_interface.nic_private :
    name => nic.ip_configuration[0].private_ip_address
  }
}
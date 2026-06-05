# Run as Administrator: Right-click PowerShell -> Run as administrator, then:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   cd "M:\REACT NATIVE\InvoiceBill"
#   .\scripts\allow-backend-firewall.ps1
#
# Or use netsh (run CMD as Admin):
#   netsh advfirewall firewall add rule name="InvoiceBill Backend" dir=in action=allow protocol=TCP localport=3000

$ruleName = "InvoiceBill Backend (Port 3000)"
try {
  $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "Rule already exists. Done."
    exit 0
  }
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private
  Write-Host "Firewall rule added. Restart the app on your phone."
} catch {
  Write-Host "Error: $_"
  Write-Host "Try: netsh advfirewall firewall add rule name=`"InvoiceBill Backend`" dir=in action=allow protocol=TCP localport=3000"
}

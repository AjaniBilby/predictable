`/etc/systemd/system/predictable.service`
```toml
[Unit]
Description=Predictable Bot Server
After=network.target

[Service]
User=github
Group=github
WorkingDirectory=/srv/predictable
ExecStart=bash /srv/predictable/startup.bash
Restart=always
StandardOutput=append:/srv/predictable/stdout.log
StandardError=append:/srv/predictable/stderr.log

[Install]
WantedBy=multi-user.target
```

Bind the new service
```
sudo systemctl daemon-reload
sudo systemctl enable predictableI.service
```
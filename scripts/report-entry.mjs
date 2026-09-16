import { existsSync, copyFileSync } from 'node:fs';
for(const dir of ['docs','dist']) if(existsSync(dir+'/index.html'))copyFileSync(dir+'/index.html',dir+'/report-v3.html');

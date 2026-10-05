import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const reports=[];
for(const [width,height] of [[360,800],[390,844],[412,915],[1366,768]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('requestfailed',r=>requests.push({url:r.url(),error:r.failure()}));
 await page.goto('http://localhost:3000');await page.locator('[data-progress-ready="true"]').waitFor();
 for(const area of ['Mapa','Aula','Treino','Provas','Exercícios','Revisão']){
   await page.getByRole('button',{name:area,exact:true}).click();
   await page.locator('.bottom-nav button.is-active').filter({hasText:area}).waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}:${area} overflow`);
   assert.equal(await page.locator('.katex-error').count(),0,`${width}:${area} math`);
   await page.evaluate(()=>window.scrollTo(0,0));
   await page.screenshot({path:`audit/evidence/${width}-viewport-${area}.png`,animations:'disabled'});
 }
 await page.getByRole('button',{name:'Revelar resposta'}).click();await page.getByRole('button',{name:'Sei',exact:true}).click();
 await page.getByRole('button',{name:'Provas',exact:true}).click();
 for(const selector of await page.locator('.proof-selector button').all()){
   await selector.click();await page.getByRole('button',{name:'Mostrar tudo'}).click();
   assert.equal(await page.locator('.katex-error').count(),0,`${width}:proof math`);
   if((await page.locator('.proof h2').innerText()).includes('LLL')) await page.screenshot({path:`audit/evidence/${width}-LLL.png`,fullPage:true,animations:'disabled'});
 }
 assert.deepEqual(errors,[],`${width} console`);assert.deepEqual(requests,[],`${width} network`);
 reports.push({width,height,areas:6,consoleErrors:errors,failedRequests:requests,horizontalOverflow:false,mathErrors:0});await page.close();
}
await browser.close();await writeFile('audit/evidence/console-qa.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));

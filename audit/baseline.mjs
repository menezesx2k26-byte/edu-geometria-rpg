import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({headless:true});
const results=[];
for(const origin of ['https://geometria-rpg-academia.menezesx2k26.chatgpt.site','http://localhost:3000']) {
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin); await page.waitForTimeout(3000); await page.getByRole('button',{name:'Treino',exact:true}).click();
 const sequence=[];
 for(let i=0;i<11;i++){sequence.push(await page.locator('.recall-card h2').innerText());await page.locator('.options button').first().click();await page.getByRole('button',{name:'Próxima questão'}).click();}
 await page.screenshot({path:`audit/evidence/${origin.includes('localhost')?'local':'production'}-before-training.png`,fullPage:true});
 await page.getByRole('button',{name:'Mapa',exact:true}).click();await page.getByRole('button',{name:'Treino',exact:true}).click();
 const reentry=await page.locator('.recall-card h2').innerText();
 await page.getByRole('button',{name:'Aula',exact:true}).click();await page.getByRole('button',{name:'Marcar como estudada'}).click();
 const storage=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
 results.push({origin,sequence,reentry,storage,errors});await page.close();
}
await writeFile('audit/evidence/baseline.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({origin:r.origin,sequence:r.sequence,reentry:r.reentry,errors:r.errors})),null,2));await browser.close();

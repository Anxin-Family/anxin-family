import { jsPDF } from 'jspdf';
import reportLogoUrl from './assets/report-logo.png?inline';

// Embed the original PNG in the bundle: exports never depend on an external image host.
let logoReady: Promise<HTMLImageElement> | undefined;
function loadLogo() {
  return logoReady ??= new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { logoReady = undefined; reject(new Error('LOGO加载失败，请刷新页面后重试保存报告。')); };
    img.src = reportLogoUrl;
  });
}

type Report = {
  total: number; label: { title: string; text: string };
  results: { dimension: string; score: number }[];
  advantage: string; action: string;
  answers: { title: string; dimension: string; answer: string }[];
};

// Paint complete A4 pages at 2x resolution: browser print settings never affect layout.
export async function makeReportPdf(report: Report, onPages?: (pages: string[]) => void): Promise<Blob> {
  const logo = await loadLogo();
  await document.fonts.ready;
  if (report.results.length !== 5 || report.answers.length !== 20 || report.results.some(r => report.answers.filter(a => a.dimension === r.dimension).length !== 4)) {
    throw new Error('报告数据不完整，请返回评估页面重新生成。');
  }
  const pages: string[] = [];
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const canvas = document.createElement('canvas');
  canvas.width = 1600; canvas.height = 2264;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('无法生成报告，请换用系统浏览器重试。');
  c.scale(2, 2);
  let page = 0;
  const ink = '#173f3a', muted = '#526c65';
  function text(t: string, x: number, y: number, width: number, size = 18, color = ink, bold = false) {
    c!.font = `${bold ? 'bold ' : ''}${size}px Calibri, "Microsoft YaHei", "PingFang SC", sans-serif`;
    c!.fillStyle = color; c!.textAlign = 'left'; c!.textBaseline = 'top';
    let line = '';
    for (const char of t) {
      if (char === '\n' || (line && c!.measureText(line + char).width > width)) {
        c!.fillText(line, x, y); y += size * 1.6; line = char === '\n' ? '' : char;
      } else line += char;
    }
    if (line) { c!.fillText(line, x, y); y += size * 1.6; }
    return y;
  }
  function start(title: string) {
    c!.fillStyle = '#f6f3ec'; c!.fillRect(0, 0, 800, 1132);
    c!.fillStyle = ink; c!.fillRect(0, 0, 800, 12);
    text('安心家庭  ·  用心规划 安心未来', 50, 38, 540, 17, muted);
    text(title, 50, 84, 540, 30, ink, true);
    // Keep the complete logo and its transparent padding; reserve a separate header column.
    const size = 140, scale = Math.min(size / logo.naturalWidth, size / logo.naturalHeight);
    const w = logo.naturalWidth * scale, h = logo.naturalHeight * scale;
    c!.drawImage(logo, 610 + (size-w)/2, 10 + (size-h)/2, w, h);
  }
  function finish() {
    text(`安心家庭需求评估报告  ·  ${++page}`, 50, 1080, 700, 13, muted);
    if (page > 1) pdf.addPage();
    const pageImage = canvas.toDataURL('image/jpeg', 0.94);
    pages.push(pageImage);
    pdf.addImage(pageImage, 'JPEG', 0, 0, 210, 297);
  }
  start('家庭准备概览');
  c.fillStyle = ink; c.fillRect(50, 145, 700, 175);
  text(`${report.total} 分  ·  ${report.label.title}`, 74, 168, 650, 30, '#ffffff', true);
  text(report.label.text, 74, 224, 650, 18, '#ffffff');
  text('五维准备图', 50, 353, 700, 23, ink, true);
  const point = (i: number, r: number) => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
    return [400 + Math.cos(a) * r, 574 + Math.sin(a) * r];
  };
  function polygon(radii: number[], fill?: string) {
    c!.beginPath(); radii.forEach((r, i) => { const p = point(i, r); if (i) c!.lineTo(p[0],p[1]); else c!.moveTo(p[0],p[1]); });
    c!.closePath(); if(fill){c!.fillStyle=fill;c!.fill();} c!.stroke();
  }
  c.strokeStyle = '#bdcec5'; c.lineWidth = 1;
  [35,70,105,140].forEach(r=>polygon(Array(5).fill(r)));
  for(let i=0;i<5;i++){const p=point(i,140); c.beginPath();c.moveTo(400,574);c.lineTo(p[0],p[1]);c.stroke();}
  c.strokeStyle=ink; c.lineWidth=2;
  polygon(report.results.map(r=>r.score*1.4),'#87b1a9');
  report.results.forEach((r,i)=>{const p=point(i,180);text(`${r.dimension} ${r.score}分`,p[0]-80,p[1]-10,160,17,ink,true);});
  let y = text('先看见优势',50,805,700,22,ink,true);
  y = text(report.advantage,50,y+8,700,18);
  text('每项满分100分；结果仅反映本次作答，不代表风险等级或保障结论。',50,991,700,15,muted);
  finish();

  start('下一步，先做好一件事');
  let y2=text('下一步优先项',50,159,700,23,ink,true);
  y2=text(report.action,50,y2+16,700,21);
  c.fillStyle=ink;c.fillRect(50,y2+35,700,160);
  text('一个小行动',74,y2+57,640,18,'#ffffff');
  text('不必一次解决所有问题，先把最重要的一件事说明白。',74,y2+99,640,25,'#ffffff',true);
  y2+=245;
  y2=text('家庭安心梳理',50,y2,700,25,ink,true);
  ['01  确认家庭现状与已有优势','02  找出最值得优先处理的一项','03  确定一项可执行的小行动'].forEach(t=>{y2=text(t,50,y2+26,700,20);});
  text('说明：本测评是一般性的家庭准备自我梳理工具。分数仅根据本次选择生成，不代表风险等级、专业评价或任何保障结论，也不构成保险销售、产品推荐、投资、医疗或法律建议。',50,900,700,16,muted);
  finish();

  // One dimension per page keeps each complete question and selected answer together.
  report.results.forEach(r=>{
    start(`作答记录 · ${r.dimension}`);
    text('以下仅显示您选择的答案。',50,139,700,16,muted);
    let y=193;
    report.answers.forEach((a,i)=>{
      if(a.dimension!==r.dimension)return;
      const top=y;
      c!.fillStyle='#ffffff';c!.fillRect(50,top,700,184);
      text(String(i+1).padStart(2,'0'),68,top+19,45,20,muted,true);
      let bottom=text(a.title,117,top+18,610,19,ink,true);
      bottom=text(a.answer,117,bottom+14,610,18,muted);
      if(bottom>top+174)throw new Error('报告文字超出页面，请联系维护人员。');
      y+=204;
    });
    finish();
  });
  canvas.width=canvas.height=1;
  if (pdf.getNumberOfPages() !== 7) throw new Error('报告页数不完整，请重试。');
  onPages?.(pages);
  return pdf.output('blob');
}

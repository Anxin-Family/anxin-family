import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import logoUrl from "./assets/anxin-family-logo.jpg";
import { makeReportPdf } from "./reportPdf";

type Dimension = "基础稳定" | "健康保障" | "责任守护" | "未来储备" | "共同准备";
type Question = {
  dimension: Dimension;
  title: string;
  hint: string;
  options: string[];
};
const dimensions: Dimension[] = [
  "基础稳定",
  "健康保障",
  "责任守护",
  "未来储备",
  "共同准备",
];
const questions: Question[] = [
  {
    dimension: "基础稳定",
    title: "如果家庭突然出现一笔较大的临时支出，您目前的准备更接近哪种情况？",
    hint: "比如收入中断、紧急就医或必要维修",
    options: [
      "基本没有专门准备",
      "可以临时周转，但会打乱生活",
      "有一部分备用资金",
      "有可覆盖6个月左右支出的应急金",
    ],
  },
  {
    dimension: "基础稳定",
    title: "您对家庭每月收入、支出和结余的了解程度如何？",
    hint: "不用精确到每一笔，大致清楚即可",
    options: [
      "不太清楚",
      "知道收入，支出比较模糊",
      "大体清楚，偶尔会梳理",
      "有清晰记录并定期复盘",
    ],
  },
  {
    dimension: "基础稳定",
    title: "如果家庭主要收入者暂时无法工作，现有资金大约能维持多久？",
    hint: "请按不明显降低当前生活质量来判断",
    options: ["不足1个月", "1—3个月", "3—6个月", "6个月以上"],
  },
  {
    dimension: "基础稳定",
    title:
      "家庭目前的房贷、车贷及其他固定还款，对每月收入的影响更接近哪种情况？",
    hint: "固定还款越高，家庭遇到收入变化时可调整的空间通常越小",
    options: [
      "已经明显影响日常生活或经常需要周转",
      "能够按时偿还，但每月压力比较大",
      "整体可以承受，仍保留一定结余",
      "负担比例合理，并预留了还款缓冲",
    ],
  },
  {
    dimension: "健康保障",
    title: "家庭成员目前的基础医保和商业医疗保障情况如何？",
    hint: "先看能否解决大额医疗费用，而不是看保单数量",
    options: [
      "不太清楚或只有部分人有医保",
      "都有医保，但没有进一步准备",
      "多数成员有补充医疗保障",
      "全家配置较完整并定期检查",
    ],
  },
  {
    dimension: "健康保障",
    title: "如果家庭成员罹患重病，除了治疗费，收入损失和康复费用有准备吗？",
    hint: "重病真正影响的，往往不只是医院账单",
    options: [
      "没有考虑过",
      "想过，但暂时没有准备",
      "有一些储蓄或保障可以应对",
      "已有相对明确的专项安排",
    ],
  },
  {
    dimension: "健康保障",
    title: "您是否清楚现有保障的范围、额度和主要限制？",
    hint: "包括等待期、免赔额、续保条件等",
    options: [
      "基本不清楚",
      "只知道买过什么",
      "大致了解主要责任",
      "清楚并做过家庭保单梳理",
    ],
  },
  {
    dimension: "健康保障",
    title:
      "如果家庭成员需要一段时间持续治疗、康复或照护，家庭是否有人力和资金方面的准备？",
    hint: "有些健康问题不仅需要治疗费用，也可能需要家人停工照护或长期康复",
    options: [
      "没有考虑过",
      "主要依靠家人临时协调",
      "在资金或照护方面有一部分准备",
      "对费用、照护人员和工作安排都有基本预案",
    ],
  },
  {
    dimension: "责任守护",
    title: "家庭主要收入者的身故或失能保障，能否覆盖未完成的家庭责任？",
    hint: "如房贷、子女成长、父母赡养",
    options: [
      "没有准备或不清楚",
      "有一些，但明显不足",
      "可以覆盖其中大部分",
      "按家庭责任测算并已基本覆盖",
    ],
  },
  {
    dimension: "责任守护",
    title: "父母赡养与子女成长两项责任，您目前如何安排？",
    hint: "这两项责任常常在同一时期叠加",
    options: [
      "主要依靠未来收入",
      "有想法，但没有具体安排",
      "其中一项已有准备",
      "两项都有相对清晰的安排",
    ],
  },
  {
    dimension: "责任守护",
    title: "夫妻或重要家庭成员是否知道关键账户、保单和重要资料放在哪里？",
    hint: "准备不仅要有，还要让家人找得到、用得上",
    options: [
      "彼此不清楚",
      "知道一部分",
      "重要信息有过沟通",
      "已集中整理并约定紧急联系人",
    ],
  },
  {
    dimension: "责任守护",
    title: "如果家庭主要责任承担者暂时无法照顾家人，家庭生活能否有人及时接续？",
    hint: "不仅要考虑收入，也要考虑接送孩子、照顾老人和处理家庭事务等责任",
    options: [
      "没有考虑过，也没有替代安排",
      "到时可能主要依靠亲友临时帮忙",
      "部分重要事务已有可以协助的人",
      "对照护、联络和重要事务都有基本安排",
    ],
  },
  {
    dimension: "未来储备",
    title: "对于孩子未来的教育或成长支持，家庭目前准备到哪一步？",
    hint: "没有孩子的家庭，可按其他长期目标作答",
    options: [
      "主要依靠未来收入",
      "开始考虑，但没有单独准备",
      "已经积累一部分",
      "目标、时间和资金来源都较清晰",
    ],
  },
  {
    dimension: "未来储备",
    title: "关于退休后的生活，您更接近下面哪种状态？",
    hint: "退休的往往不是生活，而是持续的工资收入",
    options: [
      "还没有考虑",
      "主要依靠社保养老金",
      "有储蓄或其他补充准备",
      "测算过缺口并持续储备",
    ],
  },
  {
    dimension: "未来储备",
    title: "家庭长期资金是否按不同用途进行了区分？",
    hint: "短期要用的钱和多年后才用的钱，适合用不同方式准备",
    options: [
      "基本没有区分",
      "知道要区分，但混在一起",
      "已按部分目标分开",
      "按时间、用途和流动性清晰配置",
    ],
  },
  {
    dimension: "未来储备",
    title: "对于教育、养老等长期目标，您是否计算过大概需要多少钱？",
    hint: "有目标还不够，知道需要多少、什么时候需要，准备才更容易落地",
    options: [
      "从来没有计算过",
      "大概想过，但没有具体数字",
      "对部分目标做过简单测算",
      "主要目标都有金额、时间和准备计划",
    ],
  },
  {
    dimension: "共同准备",
    title: "面对家庭重大决定，您和家人通常如何沟通？",
    hint: "包括买房、教育、养老和保障等",
    options: [
      "很少沟通或容易回避",
      "事情来了再商量",
      "重要事情会共同讨论",
      "有固定沟通和共同决策习惯",
    ],
  },
  {
    dimension: "共同准备",
    title: "如果今天只选择一件事开始，您的家庭目前有明确的优先顺序吗？",
    hint: "知道先做什么，往往比一次做很多更重要",
    options: [
      "完全没有头绪",
      "有几个想法，但不知道先后",
      "大致知道优先项",
      "优先级清晰且已有行动计划",
    ],
  },
  {
    dimension: "共同准备",
    title: "家庭成员是否清楚彼此最看重的未来目标？",
    hint: "同样是为了家庭努力，每个人心里的重点可能并不完全相同",
    options: [
      "很少谈到这些事情",
      "各自有想法，但没有认真交流",
      "对主要目标有基本共识",
      "已共同确定目标和大致行动顺序",
    ],
  },
  {
    dimension: "共同准备",
    title: "当家庭进入新的生活阶段时，您会重新检查原来的安排吗？",
    hint: "比如孩子升学、收入变化、购房、父母年老或临近退休",
    options: [
      "通常不会，遇到事情再处理",
      "意识到需要调整，但没有固定习惯",
      "发生较大变化时会重新梳理",
      "会根据家庭阶段定期检查和调整",
    ],
  },
];
const dimensionCopy: Record<Dimension, { desc: string; action: string }> = {
  基础稳定: {
    desc: "家庭面对日常波动时的缓冲与现金流秩序",
    action: "先盘点每月必要支出，逐步建立3—6个月家庭应急金。",
  },
  健康保障: {
    desc: "医疗费用、收入损失与康复期的应对准备",
    action: "把全家医保与现有保单放在一起，先确认大额医疗和重病收入损失缺口。",
  },
  责任守护: {
    desc: "家庭责任中心发生变化时，生活能否继续",
    action:
      "列出房贷、孩子成长和父母赡养三类未完成责任，再核对家庭责任中心的保障。",
  },
  未来储备: {
    desc: "教育、养老及其他长期目标的持续积累",
    action:
      "分别写下目标时间、目标金额和现有准备，避免长期目标都依赖未来收入。",
  },
  共同准备: {
    desc: "家庭成员之间的信息共享、共识与行动",
    action:
      "安排一次30分钟家庭沟通，把账户、保单、重要资料和优先事项集中记录。",
  },
};
function scoreLabel(score: number) {
  if (score >= 82)
    return {
      title: "准备较为从容",
      text: "您的家庭已经形成了不错的准备意识与行动基础。接下来更重要的，是定期复盘，让已有安排始终与家庭变化保持一致。",
    };
  if (score >= 64)
    return {
      title: "基础正在形成",
      text: "您的家庭已经在一些重要方面开始准备，也有清晰优势。若把零散安排连接起来，家庭面对变化时会更从容。",
    };
  if (score >= 46)
    return {
      title: "值得开始梳理",
      text: "您的家庭并非没有准备，只是部分安排还依赖未来收入或临时应对。找到最优先的一两件事，改变就会开始发生。",
    };
  return {
    title: "现在正适合起步",
    text: "这份结果不是风险标签，而是一张行动起点图。先完成一个最小行动，就比一次解决所有问题更有价值。",
  };
}

function BrandLogo() {
  return (
    <img
      className="brand-logo"
      src={logoUrl}
      alt="安心家庭｜用心规划 安心未来"
    />
  );
}

function RadarChart({
  results,
}: {
  results: { dimension: Dimension; score: number }[];
}) {
  const center = 150,
    radius = 100;
  const point = (index: number, scale = 1) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
    return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
  };
  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = results.map((r, i) => point(i, r.score / 100)).join(" ");
  const labelPoints = results.map((r, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    return {
      ...r,
      x: center + Math.cos(angle) * 128,
      y: center + Math.sin(angle) * 128,
    };
  });
  return (
    <div className="radar-wrap">
      <svg
        className="radar-chart"
        viewBox="0 0 300 300"
        role="img"
        aria-label="家庭五维准备雷达图"
      >
        {rings.map((r) => (
          <polygon
            key={r}
            points={results.map((_, i) => point(i, r)).join(" ")}
            className="radar-ring"
          />
        ))}
        {results.map((_, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point(i).split(",")[0]}
            y2={point(i).split(",")[1]}
            className="radar-axis"
          />
        ))}
        <polygon points={dataPoints} className="radar-area" />
        {results.map((r, i) => {
          const [x, y] = point(i, r.score / 100).split(",");
          return (
            <circle
              key={r.dimension}
              cx={x}
              cy={y}
              r="4"
              className="radar-dot"
            />
          );
        })}
        {labelPoints.map((p) => (
          <text
            key={p.dimension}
            x={p.x}
            y={p.y}
            className="radar-label"
            textAnchor={p.x < 125 ? "end" : p.x > 175 ? "start" : "middle"}
            dominantBaseline="middle"
          >
            <tspan x={p.x}>{p.dimension}</tspan>
            <tspan x={p.x} dy="15">
              {p.score}分
            </tspan>
          </text>
        ))}
      </svg>
    </div>
  );
}

const sampleResults: { dimension: Dimension; score: number }[] = [
  { dimension: "基础稳定", score: 78 },
  { dimension: "健康保障", score: 68 },
  { dimension: "责任守护", score: 74 },
  { dimension: "未来储备", score: 83 },
  { dimension: "共同准备", score: 71 },
];

function readTransferredAnswers() {
  const match = /^#report=v1-([1-4]{20})$/.exec(window.location.hash);
  return match ? [...match[1]].map(Number) : [];
}

export default function Home() {
  const [transferred] = useState(readTransferredAnswers);
  const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
  const [transferUrl, setTransferUrl] = useState("");
  const [started, setStarted] = useState(transferred.length === 20),
    [current, setCurrent] = useState(0),
    [answers, setAnswers] = useState<number[]>(transferred),
    [finished, setFinished] = useState(transferred.length === 20);
  const results = useMemo(
    () =>
      dimensions.map((d) => {
        const ids = questions
          .map((q, i) => (q.dimension === d ? i : -1))
          .filter((i) => i >= 0);
        return {
          dimension: d,
          score: Math.round(
            (ids.reduce((s, i) => s + (answers[i] ?? 0), 0) /
              (ids.length * 4)) *
              100,
          ),
        };
      }),
    [answers],
  );
  const total = finished
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / 5)
    : 0;
  const weakest = [...results].sort((a, b) => a.score - b.score)[0],
    strongest = [...results].sort((a, b) => b.score - a.score)[0];
  const restart = () => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setTransferUrl("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl("");
    setPdfPages([]);
    setPdfBlob(null);
    setPdfMessage("");
    setStarted(false);
    setFinished(false);
    setCurrent(0);
    setAnswers([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const choose = (v: number) => {
    const n = [...answers];
    n[current] = v;
    setAnswers(n);
    window.setTimeout(
      () =>
        current === questions.length - 1
          ? setFinished(true)
          : setCurrent(current + 1),
      180,
    );
  };
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const exportMode = window.location.pathname.endsWith('/report-v3.html');
  const exportStarted = useRef(false);
  const reportFilename = '安心家庭报告-7页含LOGO.pdf';
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfMessage, setPdfMessage] = useState(transferred.length === 20 ? "已恢复本次20道题的作答，请点击保存PDF报告。" : "");
  const prepareBrowserLink = () => {
    const url = new URL('report-v3.html', window.location.href);
    url.searchParams.set('v', 'pdf3');
    url.searchParams.set('open', String(Date.now()));
    url.hash = "report=v1-" + answers.join("");
    setTransferUrl(url.href);
    // WeChat's “open in browser” menu must carry the same report link as the copy button.
    window.history.replaceState(null, "", url.href);
  };
  const copyBrowserLink = async () => {
    try {
      await navigator.clipboard.writeText(transferUrl);
      setPdfMessage("报告网页链接已复制。请粘贴到系统浏览器地址栏打开，再点击保存PDF报告。");
    } catch {
      setPdfMessage("请长按下方链接全选、复制，再粘贴到系统浏览器地址栏打开。");
    }
  };
  const [pdfBusy, setPdfBusy] = useState(false);
  const saveReport = async (download = true) => {
    if (pdfBusy) return;
    if (isWeChat) {
      setPdfMessage("微信内无法可靠保存此PDF。请先准备报告网页链接，再在系统浏览器打开并保存，无需重新答题。");
      window.setTimeout(() => document.getElementById("pdf-save-status")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }
    setPdfBusy(true);
    try {
      const blob = await makeReportPdf({
        total, label: scoreLabel(total), results,
        advantage: strongest.dimension + "是您家庭目前较稳的一环。" + dimensionCopy[strongest.dimension].desc + "方面，您已经有一定基础。它会成为继续完善其他准备的重要支点。",
        action: "先从" + weakest.dimension + "开始。" + dimensionCopy[weakest.dimension].action,
        answers: questions.map((q, i) => ({
          title: q.title, dimension: q.dimension,
          answer: String.fromCharCode(64 + answers[i]) + "．" + q.options[answers[i] - 1],
        })),
      }, setPdfPages);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url); setPdfBlob(blob);
      setPdfMessage("已生成完整7页PDF，每页均含LOGO。请使用页面内的下载或分享存储按钮。");
      const a = document.createElement("a");
      a.href = url; a.download = reportFilename;
      if (download) { document.body.appendChild(a); a.click(); a.remove(); }
    } catch (e) {
      setPdfMessage(e instanceof Error ? e.message : "报告生成失败，请重试。");
    } finally {
      setPdfBusy(false);
    }
    window.setTimeout(() => document.getElementById("pdf-save-status")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };
  const shareReport = async () => {
    if (!pdfBlob) return;
    const file = new File([pdfBlob], reportFilename, { type: "application/pdf" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file] });
      else setPdfMessage("此浏览器不支持文件分享，请点击打开PDF，再使用浏览器的下载或存储功能。");
    } catch (e) {
      setPdfMessage(e instanceof Error && e.name === "AbortError" ? "已取消分享，您仍可打开或下载PDF。" : "分享未完成，请点击打开PDF后保存。");
    }
  };
  useEffect(() => {
    if (exportMode && finished && !isWeChat && !exportStarted.current) {
      exportStarted.current = true;
      void saveReport(false);
    }
  }, [exportMode, finished, isWeChat]);
  if (exportMode && finished && !isWeChat) return <main className="pdf-export">
    <section className="pdf-export-controls">
      <h1>保存完整报告</h1>
      <p>完整报告共7页，每页右上角均有安心家庭LOGO。请先确认下方七页预览，再保存。</p>
      <p role="status">{pdfBusy ? '正在生成七页报告，请稍候…' : pdfMessage}</p>
      {pdfUrl && pdfPages.length === 7 ? <div className="pdf-export-actions">
        <a href={pdfUrl} download={reportFilename}>下载完整7页PDF</a>
        <button onClick={shareReport}>分享 / 存储PDF</button>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">打开完整PDF</a>
      </div> : !pdfBusy && <button onClick={() => void saveReport(false)}>重新生成报告</button>}
      <p>若手机打开PDF预览，请使用预览中的下载或“存储到文件”。文件名为“{reportFilename}”。</p>
      <small>报告保存版 PDF3 · 7页 · 含LOGO</small>
    </section>
    <section className="pdf-page-list" aria-label="完整七页报告预览">
      {pdfPages.map((src, i) => <figure className="pdf-page" key={i}><figcaption>第 {i+1} / 7 页</figcaption><img src={src} alt={`报告第${i+1}页（含LOGO）`} /></figure>)}
    </section>
  </main>;
  if (!started) return (
      <main className="site-shell">
        <header className="topbar">
          <a className="brand brand-image home-brand" href="#">
            <BrandLogo />
          </a>
          <span className="quiet-link">家庭需求评估</span>
        </header>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">FAMILY READINESS CHECK</p>
            <h1>
              看见已有的准备，
              <br />
              <em>找到下一步安心。</em>
            </h1>
            <p className="lead">
              <span>用大约 5 分钟，从五个维度了解家庭当前的准备状态。</span>
              <span>
                这里没有标准家庭，也没有满分答案，只有更适合您家的行动顺序。
              </span>
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="primary"
                onClick={() => setStarted(true)}
              >
                开始评估 <span>→</span>
              </button>
              <span className="meta">20 道题 · 无需注册 · 即时结果</span>
            </div>
            <div className="trust">
              <span>✓ 不制造焦虑</span>
              <span>✓ 不推荐产品</span>
              <span>✓ 不收集姓名、手机号等身份信息</span>
              <span>✓ 作答仅在当前页面处理</span>
            </div>
          </div>
          <div className="hero-radar" aria-label="家庭五维准备示例图">
            <div className="hero-radar-title">
              <span>家庭五维准备示例</span>
              <small>分数仅作图形展示</small>
            </div>
            <RadarChart results={sampleResults} />
          </div>
        </section>
        <footer>安心家庭 · 让每一次今天的准备，成为未来的一份安心</footer>
      </main>
    );
  if (!finished) {
    const q = questions[current];
    return (
      <main className="assessment-shell">
        <header className="assessment-head">
          <button
            type="button"
            className="brand bare brand-image"
            onClick={restart}
          >
            <BrandLogo />
          </button>
          <span>
            {current + 1} / {questions.length}
          </span>
        </header>
        <div className="progress">
          <i
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
        <section className="question-wrap">
          <p className="dimension-tag">{q.dimension}</p>
          <h1>{q.title}</h1>
          <p className="question-hint">{q.hint}</p>
          <div className="options">
            {q.options.map((o, i) => (
              <button
                type="button"
                key={o}
                className={answers[current] === i + 1 ? "selected" : ""}
                onClick={() => choose(i + 1)}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {o}
              </button>
            ))}
          </div>
          <div className="question-nav">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              ← 上一题
            </button>
            <small>请根据家庭目前的真实情况选择</small>
          </div>
        </section>
      </main>
    );
  }
  const label = scoreLabel(total);
  return (
    <main className="result-shell">
      <header className="assessment-head">
        <button
          type="button"
          className="brand bare brand-image"
          onClick={restart}
        >
          <BrandLogo />
        </button>
        <button type="button" className="print" disabled={pdfBusy} onClick={() => void saveReport()}>
          {pdfBusy ? '正在生成PDF…' : '保存PDF报告'}
        </button>
      </header>
      {pdfMessage && (
        <aside id="pdf-save-status" role="status" style={{ padding: "20px", background: "#e7efe9", borderRadius: "12px", margin: "16px 0" }}>
          <p>{pdfMessage}</p>
          {isWeChat && <div style={{ marginTop: "12px" }}>
            <p>链接包含本次作答，获得链接的人可以查看报告，请勿转发。作答通过链接末尾的片段恢复，不会上传到报告服务器。</p>
            {!transferUrl ? <button type="button" onClick={prepareBrowserLink}>准备在浏览器保存</button> : <>
              <p>点击微信右上角“…”选择“在浏览器打开”；若无法恢复报告，请复制下方完整链接，粘贴到系统浏览器地址栏。</p>
              <textarea aria-label="报告网页链接" readOnly value={transferUrl} onFocus={e => e.currentTarget.select()} style={{ width: "100%", boxSizing: "border-box", minHeight: "84px", margin: "12px 0", padding: "12px", fontSize: "16px" }} />
              <button type="button" onClick={copyBrowserLink}>复制报告网页链接</button>
              <p>进入系统浏览器后，再点击“保存PDF报告”。</p>
            </>}
          </div>}
          {!isWeChat && pdfUrl && <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "12px" }}>
            <a href={pdfUrl} download={reportFilename}>下载PDF</a>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">打开完整PDF</a>
            <button type="button" onClick={shareReport}>分享 / 存储PDF</button>
          </div>}
        </aside>
      )}
      <section className="result-hero">
        <div
          className="score-ring"
          style={{ "--score": `${total * 3.6}deg` } as CSSProperties}
        >
          <div>
            <strong>{total}</strong>
            <span>综合准备度</span>
          </div>
        </div>
        <div>
          <p className="eyebrow">YOUR FAMILY REPORT</p>
          <h1>{label.title}</h1>
          <p>{label.text}</p>
        </div>
      </section>
      <section className="report-grid">
        <div className="panel radar-panel">
          <div className="panel-title">
            <h2>五维准备图</h2>
            <span>每项满分 100</span>
          </div>
          <RadarChart results={results} />
        </div>
        <div className="panel insight">
          <p className="section-kicker">先看见优势</p>
          <h2>{strongest.dimension}是您家庭目前较稳的一环</h2>
          <p>
            {dimensionCopy[strongest.dimension].desc}
            方面，您已经有一定基础。它会成为继续完善其他准备的重要支点。
          </p>
          <hr />
          <p className="section-kicker amber">下一步优先项</p>
          <h2>先从{weakest.dimension}开始</h2>
          <p>{dimensionCopy[weakest.dimension].action}</p>
        </div>
      </section>
      <section className="action-plan-card">
        <div className="action-plan-intro">
          <p className="section-kicker">一个小行动</p>
          <h2>不必一次解决所有问题，先把最重要的一件事说明白。</h2>
          <p>家庭安心梳理</p>
        </div>
        <ol className="action-plan-steps">
          <li>
            <b>01</b>
            <span>确认家庭现状与已有优势</span>
          </li>
          <li>
            <b>02</b>
            <span>找出最值得优先处理的一项</span>
          </li>
          <li>
            <b>03</b>
            <span>确定一项可执行的小行动</span>
          </li>
        </ol>
      </section>
      <section className="answers-card">
        <div className="answers-heading">
          <div>
            <p className="section-kicker">YOUR ANSWERS</p>
            <h2>本次评估作答记录</h2>
          </div>
          <p>以下仅显示您在每道题中选择的答案，方便后续回看和梳理。</p>
        </div>
        <ol className="answer-list">
          {questions.map((q, i) => (
            <li key={q.title}>
              <span className="answer-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <small>{q.dimension}</small>
                <h3>{q.title}</h3>
                <p>
                  <b>{String.fromCharCode(64 + answers[i])}</b>
                  {q.options[(answers[i] ?? 1) - 1]}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <div className="result-actions">
        <button type="button" onClick={restart}>
          重新评估
        </button>
        <button type="button" className="save-report" disabled={pdfBusy} onClick={() => void saveReport()}>
          {pdfBusy ? '正在生成PDF…' : '保存PDF报告'}
        </button>
      </div>
      <footer>
        说明：本测评是一般性的家庭准备自我梳理工具。分数仅根据本次选择生成，不代表风险等级、专业评价或任何保障结论，也不构成保险销售、产品推荐、投资、医疗或法律建议。
      </footer>
      {pdfPages.length === 7 && <section className="pdf-print-pages">{pdfPages.map((src,i)=><div className="pdf-page" key={i}><img src={src} alt={`报告第${i+1}页`}/></div>)}</section>}
    </main>
  );
}

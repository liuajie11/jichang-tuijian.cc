const REVIEW_SECTIONS = [
  ["overview", "简介与编辑结论"],
  ["price", "套餐价格与建议"],
  ["speed", "测速报告与口径"],
  ["unlock", "流媒体与 AI 解锁"],
  ["topology", "专线网络拓扑"],
  ["guide", "3 步快速上手"],
  ["troubleshoot", "常见问题排查"],
  ["faq", "5 个高频 FAQ"]
];

function currentReview() {
  const id = new URLSearchParams(location.search).get("id") || "speed";
  return AIRPORTS.find(item => item.id === id) || AIRPORTS[0];
}

function textOrPending(value, fallback = "本次未在官网或后台读取到可公开核验的固定信息。") {
  return value || fallback;
}

function buildTopology(item) {
  const nodes = item.topology || ["用户设备", "本地网络", "线路入口", "出口节点", "目标服务"];
  return nodes.map((label, index) => `
    <div class="topology-node">
      <span>0${index + 1}</span>
      <strong>${label}</strong>
    </div>
    ${index < nodes.length - 1 ? '<div class="topology-arrow" aria-hidden="true">→</div>' : ""}
  `).join("");
}

function buildFaqs(item) {
  return getFiveFaqs(item).map(([question, answer]) => `
    <article class="faq-card">
      <h3>${question}</h3>
      <p>${answer}</p>
    </article>
  `).join("");
}

function buildVerifiedData(item) {
  if (!item.priceLines?.length) {
    return `
      <div class="review-callout">
        <span class="callout-badge">i</span>
        <div>
          <strong>当前核验范围提示</strong>
          <p>该机场套餐、节点或客户端信息未能在后台完成有效核验，本文保持待复核记录，不以非官方宣传文案补全数据。</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="verified-data-grid">
      <div class="verified-card">
        <strong>${item.verified === false ? "公开核验记录" : "实测套餐快照"}</strong>
        <p>${item.priceLines.join("<br>")}</p>
      </div>
      <div class="verified-card">
        <strong>节点在线与分布</strong>
        <p>${textOrPending(item.nodeInfo)}</p>
      </div>
      <div class="verified-card">
        <strong>IPLC / IEPL 专线属性</strong>
        <p>${textOrPending(item.ipInfo)}</p>
      </div>
      <div class="verified-card">
        <strong>客户端兼容清单</strong>
        <p>${textOrPending(item.clientInfo)}</p>
      </div>
    </div>
  `;
}

function renderReviewArticle() {
  const root = document.querySelector("#review-root");
  if (!root) return;

  const item = currentReview();
  const index = AIRPORTS.findIndex(entry => entry.id === item.id);
  const previous = AIRPORTS[(index - 1 + AIRPORTS.length) % AIRPORTS.length];
  const next = AIRPORTS[(index + 1) % AIRPORTS.length];

  const metricsHtml = item.metrics.map(metric => `<span class="snapshot-metric-badge">${metric}</span>`).join("");
  const tagsHtml = item.tags.map(tag => `<span class="review-tag">${tag}</span>`).join("");
  const pricesHtml = item.priceLines?.length
    ? `<div class="price-list-box"><ul>${item.priceLines.map(line => `<li>${line}</li>`).join("")}</ul></div>`
    : `<div class="price-list-box"><p>当前未读取到后台实测套餐，购买前请在官网后台查看实时可用周期与退款规则。</p></div>`;

  const relatedHtml = AIRPORTS.filter(entry => entry.id !== item.id).slice(0, 3).map(entry => `
    <a class="related-card" href="review.html?id=${entry.id}">
      <div class="related-top">
        <span class="related-avatar">${entry.logo}</span>
        <h4>${entry.name}</h4>
      </div>
      <p>${entry.evidence}</p>
      <span class="text-link">阅读评测 →</span>
    </a>
  `).join("");

  // Update Document Meta
  document.title = `${item.name}评测：真实测速·套餐价格·IPLC专线与解锁实测｜机场推荐`;
  const descEl = document.querySelector('meta[name="description"]');
  if (descEl) {
    descEl.setAttribute("content", `${item.name}（${item.english}）独立深度评测：后台实测数据、最新套餐价格、节点延迟、Netflix与ChatGPT流媒体/AI解锁能力全维度分析与避坑建议。`);
  }

  // Left Section Menu
  const sectionNavHtml = REVIEW_SECTIONS.map(([id, label], i) => `
    <a href="#${id}" data-target="${id}">0${i + 1} · ${label}</a>
  `).join("");

  root.innerHTML = `
    <div class="review-layout">
      <!-- Left Sidebar (TOC) -->
      <aside class="review-sidebar-left">
        <div class="review-sidebar-sticky">
          <div class="sidebar-box">
            <h4 class="box-title">文章目录</h4>
            <nav class="section-menu" id="section-menu">
              ${sectionNavHtml}
            </nav>
          </div>
          <div class="sidebar-box">
            <h4 class="box-title">理性消费准则</h4>
            <div class="sidebar-links">
              <a href="coupons.html">🏷️ 优惠折扣专区</a>
              <a href="compare.html">📊 16 家横向对比</a>
              <a href="pitfalls.html">⚠️ 避坑预警清单</a>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center Main Content -->
      <main class="review-main" id="main-content">
        <div class="review-breadcrumb">
          <a href="index.html">首页</a>
          <span>/</span>
          <a href="reviews.html">机场评测</a>
          <span>/</span>
          <strong>${item.name}</strong>
        </div>

        <header class="review-header">
          <span class="review-header-pill">FIELD TEST ARCHIVE · 2026</span>
          <div class="review-header-title-wrap">
            <span class="review-avatar icon-${item.color}">${item.logo}</span>
            <div class="review-title-group">
              <h1>${item.name}<em>${item.english}</em></h1>
            </div>
          </div>
          <p class="review-lead">${item.lead}</p>
          <div class="review-tag-row">${tagsHtml}</div>
          <div class="review-actions-bar">
            <a class="btn-primary-aff" href="${item.url}" target="_blank" rel="noopener sponsored">
              进入官网入口 <span>↗</span>
            </a>
            <a class="btn-sub-action" href="compare.html">加入机场横向对比</a>
            <a class="btn-sub-action" href="coupons.html">领取优惠折扣</a>
          </div>
          <small class="aff-disclaimer">本文含推广入口。套餐、价格、节点与服务规则可能实时变化，请以下单前官网页面为准。</small>
        </header>

        <!-- Verified Metrics Box -->
        <section class="verified-snapshot-card" aria-label="${item.name}实测核验摘要">
          <div class="snapshot-header">
            <strong>官网实测核验快照</strong>
            <span class="snapshot-date">最后核验：${item.verifiedAt || "2026.10.15"}</span>
          </div>
          <div class="snapshot-metrics-row">${metricsHtml}</div>
          <p class="snapshot-evidence">${item.evidence}</p>
          <p class="snapshot-caution">⚠️ 风险提示：${item.caution}</p>
        </section>

        <!-- Section 01: Overview -->
        <section class="review-section-block" id="overview">
          <span class="section-label">01 · OVERVIEW</span>
          <h2>机场简介与编辑结论</h2>
          <p>${item.lead} 选择网络加速服务，稳定、安全、高速与高性价比不能只看广告口号，必须落到可验证的线路表现、套餐限制和售后响应上。</p>
          <div class="review-callout">
            <span class="callout-badge">✓</span>
            <div>
              <strong>适用画像与建议</strong>
              <p>${item.fit}</p>
            </div>
          </div>
          ${buildVerifiedData(item)}
        </section>

        <!-- Section 02: Pricing -->
        <section class="review-section-block" id="price">
          <span class="section-label">02 · PLANS & PRICING</span>
          <h2>套餐价格与周期建议</h2>
          <p><strong>价格参考：</strong>${item.price}。${item.priceLines?.length ? (item.verified === false ? "当前可公开核验的套餐信息如下：" : "以下为登录后台读取到的套餐快照，实际活动优惠以结账页为准：") : ""}</p>
          ${pricesHtml}
          <div class="price-advice-grid">
            <div class="advice-card">
              <strong>月付优先</strong>
              <span>适合首次体验，低成本验证晚高峰表现与本地运营商兼容性</span>
            </div>
            <div class="advice-card">
              <strong>季付验证</strong>
              <span>在连续稳定使用 1-2 个月后再考虑，平衡折扣与连续性</span>
            </div>
            <div class="advice-card">
              <strong>年付谨慎</strong>
              <span>虽有额外折扣，但需充分评估服务商长期抗风险与跑路风险</span>
            </div>
          </div>
          <p style="margin-top:14px;font-size:13.5px;color:var(--muted)">
            进一步了解折扣可在 <a href="coupons.html" style="color:var(--rust);text-decoration:underline">机场优惠码中心</a> 查看专属立减码；下单前请参考 <a href="pitfalls.html" style="color:var(--rust);text-decoration:underline">避坑指南</a>。
          </p>
        </section>

        <!-- Section 03: Speed Report -->
        <section class="review-section-block" id="speed">
          <span class="section-label">03 · SPEED REPORT</span>
          <h2>测速报告与数据口径说明</h2>
          <div class="verified-card" style="margin-bottom:14px">
            <strong>实测记录与状态</strong>
            <p>${item.speedReport || item.evidence}</p>
          </div>
          <p>需明确区分<strong>官网入口响应</strong>、<strong>客户端 Ping 延迟</strong>与<strong>实际下载带宽</strong>：入口延迟仅表示您到检测服务器的握手时间，并不等同于节点实际吞吐量。建议通过 <a href="routes.html" style="color:var(--rust);text-decoration:underline">技术线路解析</a> 了解专线与公网中转的差异，并在本地网络中实测 YouTube 4K、Speedtest 以及晚高峰（20:00 - 23:00）表现。</p>
        </section>

        <!-- Section 04: Unlock -->
        <section class="review-section-block" id="unlock">
          <span class="section-label">04 · STREAMING & AI</span>
          <h2>流媒体与 AI 工具解锁表现</h2>
          <p>${item.unlockInfo || "官网未提供完整统一的解锁清单，本文不作未经验证的承诺。"}</p>
          <div class="verified-data-grid">
            <div class="verified-card">
              <strong>流媒体解锁 (Netflix / Disney+ / YouTube)</strong>
              <p>依赖出口节点的 IP 纯净度与广播属性。通常新加坡、香港、台湾和日本的原生 IP 节点拥有最全的跨区解锁支持。</p>
            </div>
            <div class="verified-card">
              <strong>AI 工具适配 (ChatGPT / Claude / Gemini)</strong>
              <p>需要出口 IP 具备低风控评分（Fraud Score），配合客户端全局或分流规则即可顺畅使用，详见 <a href="ai-tools.html" style="color:var(--rust);text-decoration:underline">AI工具指南</a>。</p>
            </div>
          </div>
        </section>

        <!-- Section 05: Topology -->
        <section class="review-section-block" id="topology">
          <span class="section-label">05 · NETWORK TOPOLOGY</span>
          <h2>IPLC / IEPL 专线网络拓扑示意</h2>
          <p>以下为依据 ${item.name} 官网披露信息梳理的典型访问数据流转逻辑：</p>
          <div class="topology-flow" role="img" aria-label="${item.name}网络访问链路">
            ${buildTopology(item)}
          </div>
          <p class="topology-note">说明：本拓扑为逻辑示意图，用于帮助用户理解数据经过的节点层级，不代表物理机房精确坐标或运营商专有配置。</p>
        </section>

        <!-- Section 06: Guide -->
        <section class="review-section-block" id="guide">
          <span class="section-label">06 · SETUP GUIDE</span>
          <h2>从注册到连接的 3 个步骤</h2>
          <div class="steps-timeline">
            ${item.steps.map((step, sIndex) => `
              <div class="step-row">
                <span class="step-num">0${sIndex + 1}</span>
                <p>${step}</p>
              </div>
            `).join("")}
          </div>
          <p style="font-size:13.5px;color:var(--muted)">各系统（Windows / macOS / iOS / Android）详细客户端安装与规则设置，请前往 <a href="clients.html" style="color:var(--rust);text-decoration:underline">客户端教程</a>。</p>
        </section>

        <!-- Section 07: Troubleshooting -->
        <section class="review-section-block" id="troubleshoot">
          <span class="section-label">07 · TROUBLESHOOTING</span>
          <h2>连接异常与晚高峰卡顿排查</h2>
          <ul class="troubleshoot-list">
            ${item.troubleshoot.map(problem => `
              <li><i>✓</i><span>${problem}</span></li>
            `).join("")}
          </ul>
          <div class="review-callout">
            <span class="callout-badge">!</span>
            <div>
              <strong>安全与账号注意事项</strong>
              <p>切勿将个人订阅地址或后台账号密码透露给他人；避免在公共网络中明文传输配置信息。</p>
            </div>
          </div>
        </section>

        <!-- Section 08: FAQ -->
        <section class="review-section-block" id="faq">
          <span class="section-label">08 · FREQUENT QUESTIONS</span>
          <h2>关于 ${item.name} 的 5 个高频常见问题</h2>
          <div class="faq-stack">
            ${buildFaqs(item)}
          </div>
        </section>

        <!-- Pagination -->
        <nav class="review-pagination" aria-label="评测文章上下翻页">
          <a class="nav-card previous" href="review.html?id=${previous.id}">
            <span>← 上一家评测</span>
            <strong>${previous.name}</strong>
          </a>
          <a class="nav-back-list" href="reviews.html">
            16 家评测目录
          </a>
          <a class="nav-card next" href="review.html?id=${next.id}">
            <span>下一家评测 →</span>
            <strong>${next.name}</strong>
          </a>
        </nav>

        <!-- Related Reviews -->
        <section class="related-section">
          <div class="section-heading" style="margin-bottom:16px">
            <div>
              <p class="eyebrow" style="margin:0">More Field Tests</p>
              <h2 style="font-size:22px;margin:4px 0 0">更多机场独立评测</h2>
            </div>
            <a href="reviews.html" style="color:var(--rust);font-size:13.5px;font-weight:600">全部 16 家 ↗</a>
          </div>
          <div class="related-reviews-grid">
            ${relatedHtml}
          </div>
        </section>
      </main>

      <!-- Right Sidebar (Site Shortcuts) -->
      <aside class="review-sidebar-right">
        <div class="review-sidebar-sticky">
          <div class="sidebar-box">
            <h4 class="box-title">站内快捷导航</h4>
            <div class="sidebar-links">
              <a href="recommend.html"><span>🔥 机场推荐榜</span><i>→</i></a>
              <a href="compare.html"><span>📊 16家横向对比</span><i>→</i></a>
              <a href="coupons.html"><span>🏷️ 优惠折扣中心</span><i>→</i></a>
              <a href="clients.html"><span>📖 客户端配置</span><i>→</i></a>
              <a href="routes.html"><span>⚡ 专线技术知识</span><i>→</i></a>
              <a href="pitfalls.html"><span>⚠️ 避坑预警指南</span><i>→</i></a>
              <a href="ai-tools.html"><span>🤖 AI 工具导航</span><i>→</i></a>
              <a href="about.html"><span>ℹ️ 关于本站原则</span><i>→</i></a>
            </div>
          </div>
          <div class="sidebar-box">
            <h4 class="box-title">当前机场</h4>
            <p style="font-size:13px;color:var(--muted);margin:0 0 10px;line-height:1.6">
              <strong>${item.name}</strong> (${item.english})
            </p>
            <a class="btn-primary-aff" style="width:100%;box-sizing:border-box;justify-content:center;padding:8px 12px;font-size:13px" href="${item.url}" target="_blank" rel="noopener sponsored">
              直达官方注册入口 ↗
            </a>
          </div>
        </div>
      </aside>
    </div>
  `;

  // Setup ScrollSpy for TOC
  setupScrollSpy();
}

function setupScrollSpy() {
  const links = document.querySelectorAll("#section-menu a");
  const sections = document.querySelectorAll(".review-section-block");
  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(link => {
          if (link.dataset.target === id) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { rootMargin: "-100px 0px -70% 0px" });

  sections.forEach(section => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  renderReviewArticle();
});

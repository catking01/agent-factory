export type Lang = 'zh' | 'en'

export const translations = {
  // App header
  appTitle: { zh: '群智工坊：Agent Foundry', en: 'Agent Foundry' },
  appSubtitle: { zh: 'AI 公司模拟经营', en: 'AI Company Simulation' },
  tick: { zh: 'Tick', en: 'Tick' },
  auto: { zh: '自动', en: 'Auto' },
  stop: { zh: '停止', en: 'Stop' },
  export: { zh: '导出', en: 'Export' },
  newGame: { zh: '新游戏', en: 'New Game' },

  // Tabs
  dashboard: { zh: '仪表盘', en: 'Dashboard' },
  orders: { zh: '订单', en: 'Orders' },
  workshops: { zh: '车间', en: 'Workshops' },
  agents: { zh: 'AI 员工', en: 'AI Agents' },
  tasks: { zh: '任务', en: 'Tasks' },
  artifacts: { zh: '产出物', en: 'Artifacts' },
  ledger: { zh: '事件日志', en: 'Ledger' },
  debugger: { zh: '调试器', en: 'Debugger' },

  // Game over
  gameOver: { zh: '游戏结束', en: 'Game Over' },
  startNewGame: { zh: '开始新游戏', en: 'Start New Game' },
  finalScore: { zh: '最终得分', en: 'Final Score' },

  // Dashboard
  cash: { zh: '现金', en: 'Cash' },
  reputation: { zh: '声誉', en: 'Reputation' },
  evidence: { zh: '证据完整性', en: 'Evidence' },
  score: { zh: '评分', en: 'Score' },
  completed: { zh: '已完成', en: 'Completed' },
  active: { zh: '进行中', en: 'Active' },
  failed: { zh: '失败', en: 'Failed' },
  idle: { zh: '空闲', en: 'Idle' },
  working: { zh: '工作中', en: 'Working' },
  utilization: { zh: '利用率', en: 'Utilization' },
  avgQuality: { zh: '平均质量', en: 'Avg Quality' },
  reworkRate: { zh: '返工率', en: 'Rework Rate' },
  majorIncidents: { zh: '重大事故', en: 'Major Incidents' },
  queuedTasks: { zh: '排队任务', en: 'Queued Tasks' },
  revenue: { zh: '收入', en: 'Revenue' },
  costs: { zh: '支出', en: 'Costs' },
  net: { zh: '净额', en: 'Net' },
  financialSummary: { zh: '财务摘要', en: 'Financial Summary' },
  risks: { zh: '风险', en: 'Risks' },
  quality: { zh: '质量', en: 'Quality' },

  // Orders
  availableOrders: { zh: '可接订单', en: 'Available Orders' },
  activeOrders: { zh: '进行中订单', en: 'Active Orders' },
  completedOrders: { zh: '已完成订单', en: 'Completed Orders' },
  delivered: { zh: '已交付', en: 'Delivered' },
  noAvailableOrders: { zh: '暂无可用订单，等待新订单到来。', en: 'No available orders. Wait for new ones to arrive.' },
  noActiveOrders: { zh: '暂无进行中订单，接一个订单开始吧。', en: 'No active orders. Accept an order to begin.' },
  accept: { zh: '接单', en: 'Accept' },
  deliverNow: { zh: '立即交付', en: 'Deliver Now' },
  routes: { zh: '路线', en: 'Routes' },

  // Workshops
  planningW: { zh: '规划车间', en: 'Planning Workshop' },
  engineeringW: { zh: '工程车间', en: 'Engineering Workshop' },
  validationW: { zh: '验证车间', en: 'Validation Workshop' },
  auditW: { zh: '审计车间', en: 'Audit Workshop' },
  deliveryW: { zh: '交付车间', en: 'Delivery Workshop' },
  load: { zh: '负载', en: 'Load' },
  efficiency: { zh: '效率', en: 'Efficiency' },
  maintenance: { zh: '维护费', en: 'Maintenance' },
  upgrade: { zh: '升级', en: 'Upgrade' },

  // Tutorial
  firstRun: { zh: '新手引导', en: 'First Run' },
  acceptFirstOrder: { zh: '接取第一个订单', en: 'Accept your first order' },
  acceptHint: { zh: '前往 Orders 标签，对任意 Available 订单点击 Accept。', en: 'Go to the Orders tab and click "Accept" on any available order.' },
  watchAgent: { zh: '观察员工开始工作', en: 'Watch agents start working' },
  watchHint: { zh: '查看右下角 AI Workers 浮窗——员工会自动接收排队任务。', en: 'Check the AI Workers HUD (bottom-right) — agents automatically pick up queued tasks.' },
  artifactStep: { zh: '产出物已生成', en: 'An artifact is produced' },
  artifactHint: { zh: '工程车间产出 artifact。可在 Agents 或 Tasks 标签观察进度。', en: 'Engineering produces artifacts. Watch the Agents or Tasks tab for progress.' },
  validationStep: { zh: '验证已执行', en: 'Validation runs on the artifact' },
  validationHint: { zh: '验证检查缺陷。Tasks 标签可以查看验证进度。', en: 'Validation checks for defects. The Tasks tab shows validation progress.' },
  auditStep: { zh: '审计已完成', en: 'Audit reviews the artifact' },
  auditHint: { zh: '审计捕获 overclaim 和 evidence gap。跳过审计省时间但增加信任风险。', en: 'Audit catches overclaim and evidence gaps. Skipping audit saves time but increases trust risk.' },
  deliverStep: { zh: '交付第一个订单', en: 'Deliver your first order' },
  deliverHint: { zh: '流水线跑完后订单自动交付，也可以在 Orders 标签手动交付。', en: 'Once the pipeline completes, the order will be delivered automatically, or you can deliver manually from the Orders tab.' },
  hudStep: { zh: '查看 Agent 工作浮窗', en: 'Check the Agent HUD' },
  hudHint: { zh: '右下角浮窗显示员工状态、车间队列和最近事件。', en: 'The floating HUD shows agent status, workshop queues, and recent events at a glance.' },
  gotIt: { zh: '知道了！', en: 'Got it!' },
  skipTutorial: { zh: '跳过教程', en: 'Skip tutorial' },

  // Agent HUD
  aiWorkers: { zh: 'AI 员工', en: 'AI Workers' },
  blocked: { zh: '阻塞', en: 'blocked' },
  overview: { zh: '总览', en: 'Overview' },
  fatigueAvg: { zh: '平均疲劳', en: 'Fatigue avg' },
  activeTasks: { zh: '活跃任务', en: 'Active tasks' },
  bottleneck: { zh: '瓶颈', en: 'Bottleneck' },
  totalAgents: { zh: '员工总数', en: 'Total agents' },
  none: { zh: '无', en: 'none' },
  recentEvents: { zh: '最近事件', en: 'Recent Events' },

  // Debugger
  scenarioDebugger: { zh: '场景调试器', en: 'Scenario Debugger' },
  seed: { zh: '种子', en: 'Seed' },
  horizon: { zh: '时间范围', en: 'Horizon' },
  strategy: { zh: '策略', en: 'Strategy' },
  outcome: { zh: '结果', en: 'Outcome' },
  gameOverActive: { zh: '运行中', en: 'Active' },
  cashBreakdown: { zh: '现金流明细', en: 'Cash Breakdown' },
  bottlenecks: { zh: '瓶颈分析', en: 'Bottlenecks' },
  topNegativeEvents: { zh: '负面事件', en: 'Top Negative Events' },
  criticalArtifacts: { zh: '关键产出物', en: 'Critical Artifacts' },
  trustTimeline: { zh: '信任时间线', en: 'Trust Timeline' },
  eventSummary: { zh: '事件摘要', en: 'Event Summary' },
  evidenceDrops: { zh: '证据下降', en: 'Evidence Drops' },
  reputationPenalties: { zh: '声誉惩罚', en: 'Reputation Penalties' },
  totalLedgerEvents: { zh: '总事件数', en: 'Total Ledger Events' },
  salaries: { zh: '工资', en: 'Salaries' },
  parallelRoutes: { zh: '并行路线', en: 'Parallel Routes' },
  upgrades: { zh: '升级', en: 'Upgrades' },
  totalCosts: { zh: '总支出', en: 'Total Costs' },
  netPosition: { zh: '净头寸', en: 'Net Position' },

  // Shadow Advisory
  shadowAdvisory: { zh: '影子审计建议', en: 'Shadow Advisory' },
  advisoryOnly: { zh: '仅建议——不影响交付、审计或回放', en: 'advisory only — does not affect delivery, audit, or replay' },
  level: { zh: '等级', en: 'Level' },
  primaryIssue: { zh: '主要问题', en: 'Primary Issue' },
  confidence: { zh: '置信度', en: 'Confidence' },
  blockDelivery: { zh: '阻止交付?', en: 'Block Delivery?' },
  no: { zh: '否', en: 'NO' },
  alsoFlagged: { zh: '也标记了', en: 'Also flagged' },
  humanReview: { zh: '人工复核', en: 'Human Review' },
  recommended: { zh: '建议', en: 'Recommended' },
  notNeeded: { zh: '不需要', en: 'Not needed' },
  falsePositiveRisk: { zh: '误报风险', en: 'False-Positive Risk' },
  showShadowSample: { zh: '显示影子审计示例', en: 'Show Shadow Advisory (sample)' },
  hideShadowSample: { zh: '隐藏', en: 'Hide' },
  overclaimSample: { zh: 'Overclaim 示例', en: 'Overclaim sample' },
  cleanSample: { zh: 'Clean 示例', en: 'Clean sample' },

  // Language
  language: { zh: '语言', en: 'Language' },

  // Order status
  status: { zh: '状态', en: 'Status' },
  availableStatus: { zh: '可接', en: 'available' },
  acceptedStatus: { zh: '已接', en: 'accepted' },
  inProgressStatus: { zh: '进行中', en: 'in_progress' },
  deliveredStatus: { zh: '已交付', en: 'delivered' },
  failedStatus: { zh: '失败', en: 'failed' },
  criteria: { zh: '条件', en: 'Criteria' },
  complexity: { zh: '复杂度', en: 'Complexity' },
  risk: { zh: '风险', en: 'Risk' },
  ambiguity: { zh: '模糊度', en: 'Ambiguity' },
  deadline: { zh: '截止', en: 'Deadline' },
  overdue: { zh: '逾期', en: 'Overdue' },
  left: { zh: '剩余', en: 'left' },
  reward: { zh: '奖励', en: 'Reward' },
  noOrders: { zh: '暂无订单', en: 'No orders' },

  // Agent properties
  role: { zh: '角色', en: 'Role' },
  planner: { zh: '规划师', en: 'planner' },
  engineer: { zh: '工程师', en: 'engineer' },
  validator: { zh: '验证师', en: 'validator' },
  auditor: { zh: '审计师', en: 'auditor' },
  generalist: { zh: '通才', en: 'generalist' },
  planning: { zh: '规划', en: 'Planning' },
  coding: { zh: '编程', en: 'Coding' },
  validation: { zh: '验证', en: 'Validation' },
  auditing: { zh: '审计', en: 'Auditing' },
  creativity: { zh: '创造力', en: 'Creativity' },
  reliability: { zh: '可靠性', en: 'Reliability' },
  speed: { zh: '速度', en: 'Speed' },
  overclaimRisk: { zh: '吹牛风险', en: 'Overclaim Risk' },
  fatigue: { zh: '疲劳', en: 'Fatigue' },
  idleStatus: { zh: '空闲', en: 'idle' },
  workingStatus: { zh: '工作中', en: 'working' },
  fatiguedStatus: { zh: '疲劳', en: 'fatigued' },
  currentTask: { zh: '当前任务', en: 'Task' },

  // Task stages
  queued: { zh: '排队中', en: 'queued' },
  in_progress: { zh: '进行中', en: 'in_progress' },
  completedStatus: { zh: '已完成', en: 'completed' },
  noAgents: { zh: '无分配员工', en: 'No agents' },
  assign: { zh: '分配', en: 'Assign' },
  remaining: { zh: '剩余', en: 'Remaining' },
  by: { zh: '制作者', en: 'By' },

  // Artifacts
  noArtifacts: { zh: '暂无产出物。分配员工到任务以生成产出物。', en: 'No artifacts yet. Assign agents to tasks to generate artifacts.' },
  kind: { zh: '类型', en: 'Kind' },
  defects: { zh: '缺陷', en: 'Defects' },
  claim: { zh: '声明', en: 'Claim' },
  evidence2: { zh: '证据', en: 'Evidence' },
  overclaimGap: { zh: '吹牛差距', en: 'Overclaim Gap' },
  pending: { zh: '待处理', en: 'Pending' },

  // Audit results
  pass: { zh: '通过', en: 'PASS' },
  fail: { zh: '失败', en: 'FAIL' },

  // Workshop
  capacity: { zh: '容量', en: 'Capacity' },
  currentLoad: { zh: '当前负载', en: 'Current Load' },

  // Event types
  eventType: { zh: '事件类型', en: 'Event Type' },
  count: { zh: '次数', en: 'Count' },
  actor: { zh: '执行者', en: 'actor' },
  target: { zh: '目标', en: 'target' },
  noEvents: { zh: '暂无事件。推进模拟以生成事件。', en: 'No events yet. Advance the simulation to generate events.' },

  // Debugger internal labels
  category: { zh: '类别', en: 'Category' },
  amount: { zh: '金额', en: 'Amount' },
  maxQueue: { zh: '最大排队', en: 'Max queue' },
  noCriticalArtifacts: { zh: '无关键产出物。', en: 'No critical artifacts.' },
  noNegativeEvents: { zh: '无负面事件。', en: 'No negative events recorded.' },
  noTrustChanges: { zh: '无信任指标变化记录。', en: 'No trust metric changes recorded.' },

  // Filter
  filter: { zh: '筛选', en: 'Filter' },
  all: { zh: '全部', en: 'All' },
  recent: { zh: '最近', en: 'Recent' },

  // Misc
  pending2: { zh: '待处理', en: 'Pending' },
  total: { zh: '总计', en: 'Total' },
  active2: { zh: '活跃', en: 'active' },
  queued2: { zh: '排队', en: 'queued' },
  agentsAvailable: { zh: '个员工可用', en: 'agents available' },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang]
}

import {
  Award,
  BadgeCheck,
  Bean,
  Coffee,
  CupSoda,
  LineChart,
  Mountain,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.26 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

const metrics = [
  { label: '销售额', value: '¥ 482.6K', change: '+12.4%', icon: LineChart },
  { label: '订单量', value: '18,642', change: '+8.7%', icon: ShoppingBag },
  { label: '会员增长', value: '3,816', change: '+16.1%', icon: UsersRound },
  { label: '门店数据', value: '126', change: '稳定', icon: Store },
]

const flavorCards = [
  { title: 'Espresso', metric: '91.8', label: '风味评分', tone: '浓缩咖啡' },
  { title: 'Oat Latte', metric: '68%', label: '复购率', tone: '燕麦奶' },
  { title: 'Brown Sugar Milk Tea', metric: '12.4K', label: '周销量', tone: '黑糖奶茶' },
]

function AmbientDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-32 top-28 h-72 w-72 rounded-full border border-espresso/10" />
      <div className="absolute -left-20 top-40 h-44 w-44 rounded-full border border-ocean/10" />
      <div className="absolute right-[-7rem] top-20 h-80 w-80 rounded-full border-[18px] border-champagne/10" />
      <Bean className="absolute right-20 top-[42%] h-28 w-28 rotate-12 text-espresso/[0.07]" strokeWidth={1.2} />
      <Coffee className="absolute left-12 bottom-44 h-32 w-32 -rotate-12 text-espresso/[0.06]" strokeWidth={1.2} />
      <CupSoda className="absolute right-16 bottom-28 h-36 w-36 text-ocean/[0.06]" strokeWidth={1.2} />
      <svg className="absolute left-[48%] top-8 h-48 w-96 text-ocean/[0.07]" viewBox="0 0 420 160" fill="none">
        <path d="M14 104C78 24 131 141 205 70C265 13 314 44 397 22" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <path d="M22 132C109 74 155 154 232 104C298 61 337 84 398 69" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function TopHeader() {
  return (
    <motion.header
      {...fadeIn}
      className="relative z-10 mb-14 flex flex-col gap-7 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-wrap items-center gap-4">
        <span className="rounded-md bg-espresso px-4 py-2 text-sm font-semibold tracking-[0.16em] text-white shadow-sm md:bg-ocean">
          设计案例
        </span>
        <span className="font-script text-2xl text-espresso md:text-3xl">
          都是真案例，合作真省心
        </span>
      </div>
      <div className="text-left md:text-right">
        <span className="mr-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
          Supreme
        </span>
        <span className="text-xl font-semibold text-ink/80">至上</span>
      </div>
    </motion.header>
  )
}

function FirstCase() {
  return (
    <motion.section
      {...fadeIn}
      className="group relative mb-16 overflow-hidden rounded-[20px] bg-cream p-5 shadow-soft ring-1 ring-line/80 md:p-8"
    >
      <div className="absolute right-10 top-8 flex gap-5 text-espresso/15">
        <Coffee className="h-10 w-10" strokeWidth={1.3} />
        <Bean className="h-10 w-10" strokeWidth={1.3} />
        <CupSoda className="h-10 w-10" strokeWidth={1.3} />
        <Award className="h-10 w-10" strokeWidth={1.3} />
      </div>

      <motion.div
        whileHover={{ y: -6, scale: 1.006 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[20px] bg-white shadow-cafe ring-1 ring-line"
      >
        <div className="grid min-h-[620px] grid-cols-1 lg:grid-cols-[250px_1fr]">
          <aside className="border-b border-line bg-[#F8FAFD] p-7 lg:border-b-0 lg:border-r">
            <div className="mb-12 flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-ink" />
              <div>
                <p className="text-sm font-bold text-ink">Credit Studio</p>
                <p className="text-xs text-copy">Merchant Risk OS</p>
              </div>
            </div>
            {['Portfolio', 'Orders', 'Members', 'Stores', 'Reports'].map((item, index) => (
              <div
                key={item}
                className={`mb-3 rounded-lg px-4 py-3 text-sm ${
                  index === 0 ? 'bg-ocean text-white' : 'text-copy'
                }`}
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="relative p-7 md:p-10">
            <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-ocean">
                  Enterprise Data Dashboard
                </p>
                <h2 className="max-w-2xl text-3xl font-black tracking-tight text-ink md:text-5xl">
                  经营数据与授信初审合并呈现
                </h2>
              </div>
              <div className="rounded-xl border border-line bg-[#FAFCFF] px-5 py-4 text-right">
                <p className="text-sm text-copy">质量指数</p>
                <p className="text-3xl font-black text-champagne">A+</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map(({ label, value, change, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-line bg-white p-5">
                  <Icon className="mb-5 h-6 w-6 text-ocean" strokeWidth={1.8} />
                  <p className="text-sm text-copy">{label}</p>
                  <p className="mt-2 text-2xl font-black text-ink">{value}</p>
                  <p className="mt-2 text-sm font-semibold text-champagne">{change}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-2xl border border-line bg-[#F8FBFF] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-bold text-ink">门店经营曲线</p>
                  <span className="text-sm text-copy">Last 12 weeks</span>
                </div>
                <div className="flex h-52 items-end gap-3">
                  {[34, 48, 42, 63, 58, 72, 66, 81, 76, 88, 92, 86].map((height, index) => (
                    <div key={index} className="flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-ocean to-[#9DC4F4]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-[#FFFCF6] p-6">
                <BadgeCheck className="mb-4 h-8 w-8 text-champagne" strokeWidth={1.8} />
                <p className="text-sm text-copy">品质徽章</p>
                <p className="mt-3 text-2xl font-black text-ink">稳健经营样本</p>
                <p className="mt-4 text-sm leading-7 text-copy">
                  用销售额、订单量、会员增长和门店数据形成授信前的经营画像。
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <h3 className="pointer-events-none absolute bottom-4 left-5 text-[3.4rem] font-black leading-none tracking-[-0.06em] text-ink md:bottom-8 md:left-10 md:text-[6.8rem]">
        客户给我们的
      </h3>
    </motion.section>
  )
}

function MountainHero() {
  return (
    <div className="relative h-[300px] overflow-hidden rounded-b-[20px] bg-[#DCE8F3]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#D9E7F4] via-[#C7D8E8] to-[#EFF5FA]" />
      <svg className="absolute inset-x-0 bottom-0 h-full w-full" viewBox="0 0 1000 330" preserveAspectRatio="none">
        <path d="M0 270L170 145L300 235L470 104L645 242L785 132L1000 260V330H0Z" fill="#BFD0E1" />
        <path d="M0 292L210 192L360 262L528 152L700 276L852 190L1000 278V330H0Z" fill="#D8E2EC" />
        <path d="M0 310L180 250L365 292L540 236L720 302L910 245L1000 298V330H0Z" fill="#EEF4FA" />
      </svg>
      <svg className="absolute right-16 top-12 h-36 w-72 text-white/45" viewBox="0 0 300 140" fill="none">
        <path d="M20 82C58 30 96 125 138 76C181 26 218 91 275 38" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
        <path d="M30 111C79 68 113 128 165 95C211 66 240 87 280 70" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="absolute left-8 top-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/85">DAILY FLAVOR INDEX</p>
        <p className="mt-4 text-6xl font-black tracking-[-0.07em] text-white">37.62 <span className="text-4xl text-champagne">↑</span></p>
      </div>
    </div>
  )
}

function SecondCase() {
  return (
    <motion.section
      {...fadeIn}
      className="group relative overflow-hidden rounded-[20px] bg-[#F3ECE2] p-5 shadow-soft ring-1 ring-line/80 md:p-8"
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.006 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[20px] bg-white shadow-cafe ring-1 ring-line"
      >
        <div className="flex items-center justify-between bg-ink px-6 py-5 text-white md:px-8">
          <div className="flex items-center gap-3">
            <Mountain className="h-6 w-6 text-champagne" strokeWidth={1.7} />
            <span className="font-bold tracking-tight">Flavor Risk Atlas</span>
          </div>
          <div className="hidden gap-8 text-sm text-white/62 md:flex">
            <span>Index</span>
            <span>Stores</span>
            <span>Contracts</span>
            <span>Signals</span>
          </div>
        </div>

        <MountainHero />

        <div className="relative z-10 -mt-12 grid gap-5 px-6 pb-10 md:grid-cols-3 md:px-10">
          {flavorCards.map((card) => (
            <div key={card.title} className="rounded-[20px] border border-line bg-cream p-6 shadow-cafe">
              <p className="mb-8 text-sm text-copy">{card.tone}</p>
              <h4 className="text-xl font-black text-espresso">{card.title}</h4>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black tracking-[-0.04em] text-ink">{card.metric}</p>
                  <p className="mt-1 text-sm text-copy">{card.label}</p>
                </div>
                <Sparkles className="h-6 w-6 text-champagne" strokeWidth={1.8} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <h3 className="pointer-events-none absolute bottom-4 left-5 text-[3.3rem] font-black leading-none tracking-[-0.06em] text-espresso md:bottom-8 md:left-10 md:text-[6.4rem]">
        我们给客户的
      </h3>
    </motion.section>
  )
}

export default function App() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-glacier via-mist to-[#F7EFE7] px-5 py-10 text-ink md:px-10 md:py-16">
      <AmbientDecor />
      <section className="relative mx-auto max-w-[1400px]">
        <TopHeader />
        <div className="mb-12 max-w-4xl">
          <motion.p
            {...fadeIn}
            className="text-balance text-3xl font-black leading-tight tracking-[-0.045em] text-ink md:text-6xl"
          >
            为茶饮咖啡小微商户打造可信赖的数字风控案例展示。
          </motion.p>
          <motion.p
            {...fadeIn}
            transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 max-w-3xl text-lg leading-9 text-copy"
          >
            以高端企业案例展示为主，轻量融入精品咖啡与现代奶茶气质，用克制的排版和数据样机呈现风控系统的专业感。
          </motion.p>
        </div>
        <FirstCase />
        <SecondCase />
      </section>
    </main>
  )
}

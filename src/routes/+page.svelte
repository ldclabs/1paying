<script lang="ts">
  import { goto, preloadCode } from '$app/navigation'
  import { fadeIn, parallax, staggerChildren } from '$lib/animations/motion'
  import { neuralGrid } from '$lib/animations/neuralGrid'
  import Header from '$lib/components/Header.svelte'
  import ArrowRightUpLine from '$lib/icons/arrow-right-up-line.svelte'
  import MenuFill from '$lib/icons/menu-fill.svelte'
  import MenuUnfoldLine from '$lib/icons/menu-unfold-line.svelte'
  import Wallet3Line from '$lib/icons/wallet-3-line.svelte'
  import VerifiedBadgeFill from '$lib/icons/verified-badge-fill.svelte'
  import ExchangeFundsLine from '$lib/icons/exchange-funds-line.svelte'
  import CheckDoubleLine from '$lib/icons/check-double-line.svelte'
  import AppsAiLine from '$lib/icons/apps-ai-line.svelte'
  import QrScanLine from '$lib/icons/qr-scan-line.svelte'
  import RefreshLine from '$lib/icons/refresh-line.svelte'
  import PrimaryButton from '$lib/ui/PrimaryButton.svelte'
  import { onMount } from 'svelte'

  const navLinks = [
    { label: 'App', href: '#app' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Merchants', href: '#merchants' },
    { label: 'Token', href: '#tokenomics' },
    { label: 'Contact', href: '#contact' }
  ]

  const heroChecklist = [
    'Pay per article, per minute, or per request',
    'No monthly subscriptions or credit card forms',
    'One secure wallet for the entire web'
  ]

  const userBenefits = [
    {
      title: 'Freedom from Subscriptions',
      icon: VerifiedBadgeFill,
      description:
        'Why pay $15/month when you only want to read one article? With 1Pay.ing, you pay pennies for exactly what you consume. No waste, no commitments.'
    },
    {
      title: 'One Wallet, Zero Friction',
      icon: Wallet3Line,
      description:
        'Forget creating accounts and entering credit card details for every site. Your 1Pay.ing wallet is your universal pass to the premium web.'
    },
    {
      title: 'Global & Private',
      icon: ExchangeFundsLine,
      description:
        "Works anywhere in the world. You don't need a bank account, just an internet connection. You control your data and your funds."
    },
    {
      title: 'Fair for Everyone',
      icon: CheckDoubleLine,
      description:
        'Creators get paid instantly for their work. You pay less by only buying what you need. We removed the middlemen and the fees.'
    }
  ]

  const howItWorks = [
    {
      title: '1. Discover',
      icon: AppsAiLine,
      description:
        'Find premium content, AI tools, or APIs you want to use. Look for the "Pay with 1Pay.ing" option.'
    },
    {
      title: '2. One-Click Pay',
      icon: QrScanLine,
      description:
        'No login forms. The 1Pay.ing wallet pops up with the exact price (e.g., $0.02). Just tap "Approve".'
    },
    {
      title: '3. Instant Access',
      icon: RefreshLine,
      description:
        "The payment settles in milliseconds. Your content unlocks immediately. It's faster than loading a credit card page."
    }
  ]

  const codeSample = `
<pre style="font-family:monospace;color: rgb(201, 209, 217); background-color: rgb(13, 17, 23); font-weight: 400; "><span style="color: rgb(255, 123, 114); font-weight: 400;">import</span> { payingKit } <span style="color: rgb(255, 123, 114); font-weight: 400;">from</span> <span style="color: rgb(165, 214, 255); font-weight: 400;">'@ldclabs/1paying-kit'</span>

<span style="color: rgb(139, 148, 158); font-weight: 400;">// 1. Check if the resource requires payment</span>
<span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> { payUrl, txid } = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> payingKit.<span style="color: rgb(210, 168, 255); font-weight: 400;">tryGetPayUrl</span>(response)

<span style="color: rgb(255, 123, 114); font-weight: 400;">if</span> (payUrl) {
  <span style="color: rgb(139, 148, 158); font-weight: 400;">// 2. Redirect user to 1Pay.ing to sign</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">window</span>.<span style="color: rgb(210, 168, 255); font-weight: 400;">open</span>(payUrl, <span style="color: rgb(165, 214, 255); font-weight: 400;">'1Pay.ing'</span>)

  <span style="color: rgb(139, 148, 158); font-weight: 400;">// 3. Wait for payment proof</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">const</span> proof = <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> payingKit.<span style="color: rgb(210, 168, 255); font-weight: 400;">waitForPaymentPayload</span>(txid)

  <span style="color: rgb(139, 148, 158); font-weight: 400;">// 4. Retry request with proof</span>
  <span style="color: rgb(255, 123, 114); font-weight: 400;">await</span> <span style="color: rgb(210, 168, 255); font-weight: 400;">fetch</span>(url, { <span style="color: rgb(121, 192, 255); font-weight: 400;">headers</span>: { <span style="color: rgb(165, 214, 255); font-weight: 400;">'PAYMENT-SIGNATURE'</span>: proof } })
}</pre>
`

  const developerHighlights = [
    {
      badge: 'Easy',
      title: 'Drop-in Monetization',
      description:
        "Add a revenue stream to your API, blog, or app in minutes. Our SDK handles the complex crypto parts so you don't have to."
    },
    {
      badge: 'Universal',
      title: 'Any Wallet, Any Chain',
      description:
        'Your users can pay with their favorite wallets (Phantom, MetaMask, etc.). We handle the compatibility.'
    },
    {
      badge: 'Secure',
      title: 'Non-Custodial',
      description:
        'We never hold your funds. Payments go directly from the user to you (or your smart contract). Secure by design.'
    },
    {
      badge: 'Flexible',
      title: 'Micro to Macro',
      description:
        'Charge $0.001 per API call or $100 for a digital asset. The protocol supports any amount with near-zero fees.'
    },
    {
      badge: 'Identity',
      title: 'Web2 Friendly',
      description:
        'Keep your existing user accounts. 1Pay.ing simply attaches a payment proof to their requests.'
    },
    {
      badge: 'Growth',
      title: 'Better Conversion',
      description:
        'Users are more likely to pay $0.50 once than subscribe for $10/month. Lower the barrier to entry and increase your revenue.'
    }
  ]

  const tokenFlywheels = [
    {
      title: 'Earn by Integrating',
      description:
        'Merchants and creators who add 1Pay.ing to their apps earn rewards for every transaction they facilitate. The more you build, the more you earn.'
    },
    {
      title: 'Earn by Spending',
      description:
        'Users get "cashback" in PAY tokens for using the network. It pays to be an active part of the ecosystem.'
    }
  ]

  const tokenUtilities = [
    {
      badge: 'Merchants',
      title: 'For Merchants',
      points: [
        'Earn Rewards: Get extra PAY tokens automatically for every payment you process.',
        'Premium Features: Stake PAY to access advanced analytics and gas sponsorship for your users.'
      ]
    },
    {
      badge: 'Users',
      title: 'For Everyone',
      points: [
        'Pay-to-Earn: Receive PAY rebates on your transaction fees.',
        'Governance: Have a say in how the platform evolves and where the treasury funds go.'
      ]
    },
    {
      badge: 'Ecosystem',
      title: 'Shared Success',
      points: [
        'The token aligns incentives between those who build the tools and those who use them.',
        'A portion of fees buys back and burns PAY, making the token scarcer over time.'
      ]
    }
  ]

  const tokenAllocations = [
    {
      label: 'Community Rewards',
      value: '40% • 400M PAY',
      percentage: 40,
      description:
        'Incentives for merchants and users to grow the network (Earn by Integrating & Pay-to-Earn).'
    },
    {
      label: 'Public Sale & Liquidity',
      value: '20% • 200M PAY',
      percentage: 20,
      description:
        'Ensuring there is enough liquidity for everyone to buy and sell PAY easily.'
    },
    {
      label: 'Core Team',
      value: '18% • 180M PAY',
      percentage: 18,
      description:
        'Vested over 3 years to ensure the team is committed to long-term success.'
    },
    {
      label: 'Partners & Advisors',
      value: '12% • 120M PAY',
      percentage: 12,
      description: 'For strategic partners who help us expand into new markets.'
    },
    {
      label: 'Treasury',
      value: '10% • 100M PAY',
      percentage: 10,
      description:
        'Funds for operations, marketing, and legal to keep the platform running smoothly.'
    }
  ]

  const tokenAllocationTotal = {
    label: 'Total Supply',
    value: '1B PAY',
    description:
      'Fixed supply. No inflation. Designed to power the value-native economy.'
  }

  const tokenAllocationPalette = [
    '#0ea5e9',
    '#6366f1',
    '#38bdf8',
    '#a855f7',
    '#f97316'
  ]
  const tokenAllocationChartCenter = 100
  const tokenAllocationChartRadius = 90
  const tokenAllocationChartInnerRadius = 55

  function polarToCartesian(
    cx: number,
    cy: number,
    radius: number,
    angle: number
  ) {
    const radians = ((angle - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    }
  }

  function describeArc(
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(cx, cy, radius, startAngle)
    const end = polarToCartesian(cx, cy, radius, endAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  const tokenAllocationSlices = (() => {
    const total = tokenAllocations.reduce(
      (sum, allocation) => sum + allocation.percentage,
      0
    )
    let cumulative = 0

    return tokenAllocations.map((allocation, index) => {
      const startAngle = (cumulative / total) * 360
      cumulative += allocation.percentage
      const endAngle = (cumulative / total) * 360

      return {
        ...allocation,
        color: tokenAllocationPalette[index % tokenAllocationPalette.length],
        path: describeArc(
          tokenAllocationChartCenter,
          tokenAllocationChartCenter,
          tokenAllocationChartRadius,
          startAngle,
          endAngle
        )
      }
    })
  })()

  const tokenLaunchPlan = [
    {
      title: 'Fair Launch',
      description:
        'We are launching with a Liquidity Bootstrapping Pool (LBP) to ensure fair price discovery for everyone.'
    },
    {
      title: 'Locked Liquidity',
      description:
        'We are locking the initial liquidity for 36 months to demonstrate our long-term commitment.'
    }
  ]

  const tokenFlywheelLoop = [
    'Adoption: Merchants integrate 1Pay.ing to monetize their apps.',
    'Usage: Users pay for content/services using the 1Pay.ing wallet.',
    'Rewards: Both merchants and users earn PAY tokens for transacting.',
    'Growth: More users attract more merchants, creating a positive loop.',
    'Value: Increased network activity drives demand for the PAY token.'
  ]

  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Docs', href: 'https://github.com/ldclabs/1paying-kit' },
        { label: 'GitHub', href: 'https://github.com/ldclabs/1paying' }
      ]
    },
    {
      title: 'Community',
      links: [
        {
          label: 'X (Twitter)',
          href: 'https://x.com/i/communities/1988555176517513709'
        }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: 'https://x.com/1Paying' },
        { label: 'Contact', href: 'mailto:hi@1pay.ing' }
      ]
    }
  ]

  let mobileNavOpen = $state(false)
  let isLoadingApp = $state(false)

  onMount(() => {
    preloadCode('/app').catch(() => {
      /* ignore */
    })
  })

  function launchApp() {
    if (isLoadingApp) return
    isLoadingApp = true
    goto('/app')
  }
</script>

<div class="flex min-h-screen flex-col bg-white text-slate-900">
  <Header>
    <button
      type="button"
      class="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-slate-600 sm:hidden"
      onclick={() => (mobileNavOpen = !mobileNavOpen)}
      aria-controls="primary-navigation"
      aria-expanded={mobileNavOpen}
    >
      <span>
        {#if mobileNavOpen}
          <MenuUnfoldLine />
        {:else}
          <MenuFill />
        {/if}
      </span>
    </button>
    <nav
      id="primary-navigation"
      class={`w-full flex-col gap-6 text-sm font-medium text-slate-600 ${mobileNavOpen ? 'mb-2 flex' : 'hidden'} sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-6`}
    >
      {#each navLinks as link}
        <a
          class="transition hover:text-slate-900"
          href={link.href}
          onclick={() => (mobileNavOpen = false)}
        >
          {link.label}
        </a>
      {/each}
      <a
        class="rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
        href="https://github.com/ldclabs/1paying-kit"
        target="1PayingKit"
        onclick={() => (mobileNavOpen = false)}
      >
        Get Started
      </a>
    </nav>
  </Header>

  <main class="max-w-full flex-1">
    <section
      id="app"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-[calc(100vh-80px)] overflow-hidden"
    >
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.1),transparent_50%)]"
      ></div>
      <div
        use:parallax={{ speed: 0.18 }}
        class="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 lg:flex-row lg:items-center lg:py-24"
      >
        <div use:fadeIn class="max-w-2xl space-y-8">
          <div class="space-y-4">
            <span
              class="inline-flex items-center rounded-full border border-sky-100 bg-sky-50/50 px-4 py-1 text-xs font-bold tracking-[0.2em] text-sky-600 uppercase backdrop-blur-sm"
            >
              The Future of Payments
            </span>
            <h1
              class="font-outfit text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
            >
              Unlock the Web, <br />
              <span
                class="bg-linear-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent"
              >
                One Cent at a Time.
              </span>
            </h1>
          </div>
          <p class="text-lg leading-relaxed text-slate-600 sm:text-xl">
            <span class="font-outfit font-bold text-slate-900">1Pay.ing</span> is
            the universal wallet for the new economy. Pay $0.01 for an article or
            $0.05 for an AI image. No subscriptions. No sign-ups. Just instant access.
          </p>

          <ul class="space-y-3 text-sm font-medium text-slate-600">
            {#each heroChecklist as item}
              <li class="flex items-center gap-3">
                <div
                  class="flex size-5 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm"
                >
                  <svg
                    class="size-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{item}</span>
              </li>
            {/each}
          </ul>

          <div class="flex flex-wrap gap-4 pt-4">
            <PrimaryButton
              onclick={launchApp}
              isLoading={isLoadingApp}
              class="h-12 rounded-full bg-sky-600 px-8 text-base font-bold text-white shadow-lg shadow-sky-200 transition-all hover:bg-sky-700 hover:shadow-sky-300 active:scale-95"
            >
              Launch Wallet
            </PrimaryButton>
            <a
              href="#merchants"
              class="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-base font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95"
            >
              For Merchants
            </a>
          </div>
        </div>

        <div
          use:fadeIn={{ delay: 200 }}
          class="relative w-full max-w-md self-center lg:max-w-lg"
        >
          <div
            class="absolute -inset-4 rounded-4xl bg-linear-to-tr from-sky-500/20 to-indigo-500/20 blur-2xl"
          ></div>
          <div
            class="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-sky-500/10 backdrop-blur-xl"
          >
            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <h2
                class="text-xs font-bold tracking-[0.3em] text-slate-400 uppercase"
              >
                Live Experience
              </h2>
              <div class="flex items-center gap-2">
                <span class="relative flex h-2 w-2">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex h-2 w-2 rounded-full bg-green-500"
                  ></span>
                </span>
                <span class="text-[10px] font-bold text-slate-500 uppercase"
                  >Network Active</span
                >
              </div>
            </div>

            <div class="mt-8 space-y-6">
              <div
                class="rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-md"
              >
                <h3 class="text-sm font-bold text-slate-900"
                  >Imagine a web where you can:</h3
                >
                <ul class="mt-4 space-y-3">
                  <li class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">Read a premium article</span>
                    <span class="font-outfit font-bold text-sky-600">$0.10</span
                    >
                  </li>
                  <li class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">Generate an AI image</span>
                    <span class="font-outfit font-bold text-sky-600">$0.05</span
                    >
                  </li>
                  <li class="flex items-center justify-between text-sm">
                    <span class="text-slate-600">Watch a video ad-free</span>
                    <span class="font-outfit font-bold text-sky-600">$0.02</span
                    >
                  </li>
                </ul>
              </div>

              <div
                class="rounded-xl bg-linear-to-br from-slate-900 to-slate-800 p-6 text-white shadow-xl"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase"
                      >Demo Payment</p
                    >
                    <p class="mt-1 text-lg font-bold">Buy us a coffee</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-bold text-slate-400 uppercase"
                      >Price</p
                    >
                    <p class="font-outfit mt-1 text-lg font-bold text-sky-400"
                      >$1.00</p
                    >
                  </div>
                </div>
                <a
                  class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-3 text-sm font-bold transition-all hover:bg-sky-400 active:scale-95"
                  href="https://1paying-coffee.zensh.workers.dev/"
                  target="1PayingCoffeeDemo"
                >
                  <span>Pay with 1Pay.ing</span>
                  <ArrowRightUpLine />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      id="benefits"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen border-y border-slate-100 bg-slate-50/50 py-16 lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn class="text-center">
          <p class="text-xs font-bold tracking-[0.3em] text-sky-600 uppercase"
            >Why 1Pay.ing?</p
          >
          <h2
            class="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            The web was broken. We fixed it.
          </h2>
          <p class="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Subscriptions are expensive. Ads are annoying.
            <span class="font-outfit font-bold text-slate-900">1Pay.ing</span> brings
            back the original vision of the internet: a place where value flows freely
            between creators and users.
          </p>
        </div>
        <div use:staggerChildren class="mt-16 grid gap-6 md:grid-cols-2">
          {#each userBenefits as benefit}
            <article
              class="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/5"
            >
              <div
                class="mb-6 flex size-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-500 group-hover:text-white"
              >
                <benefit.icon />
              </div>
              <h3 class="text-xl font-bold text-slate-900">{benefit.title}</h3>
              <p class="mt-4 leading-relaxed text-slate-600">
                {benefit.description}
              </p>
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section
      id="merchants"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen py-16 lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p class="text-xs font-bold tracking-[0.3em] text-sky-600 uppercase"
            >For Merchants & Creators</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            Monetize anything in minutes.
          </h2>
          <p class="mt-6 max-w-3xl text-lg text-slate-600">
            Stop losing revenue to complex subscriptions. With <span
              class="font-outfit font-bold text-slate-900">1Pay.ing</span
            >, you can monetize any content, tool, or service instantly. Simple
            for you, seamless for your users.
          </p>
        </div>
        <div class="mt-16 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div use:staggerChildren class="space-y-8">
            <h3
              class="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase"
              >Your Customer's Journey</h3
            >
            <div
              class="relative space-y-8 before:absolute before:top-2 before:left-6 before:h-[calc(100%-16px)] before:w-px before:bg-slate-100"
            >
              {#each howItWorks as step}
                <div
                  class="relative flex gap-6 rounded-2xl border border-transparent p-4 transition-all hover:border-slate-100 hover:bg-slate-50/50"
                >
                  <div
                    class="relative z-10 flex size-12 flex-none items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-slate-50"
                  >
                    <div class="text-sky-600">
                      <step.icon />
                    </div>
                  </div>
                  <div>
                    <h4 class="text-lg font-bold text-slate-900"
                      >{step.title}</h4
                    >
                    <p class="mt-2 text-sm leading-relaxed text-slate-600"
                      >{step.description}</p
                    >
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <div
            use:fadeIn={{ delay: 300 }}
            class="flex min-w-0 flex-col rounded-3xl border border-slate-100 bg-white p-2 shadow-2xl shadow-sky-500/5"
          >
            <div class="rounded-2xl bg-slate-900 p-8">
              <div class="mb-6 flex items-center justify-between">
                <div class="flex gap-1.5">
                  <div class="size-3 rounded-full bg-red-500/20"></div>
                  <div class="size-3 rounded-full bg-amber-500/20"></div>
                  <div class="size-3 rounded-full bg-emerald-500/20"></div>
                </div>
                <div
                  class="text-[10px] font-bold tracking-widest text-slate-500 uppercase"
                  >Integration Example</div
                >
              </div>
              <div class="overflow-x-auto font-mono text-sm leading-relaxed">
                {@html codeSample}
              </div>
            </div>
            <div class="p-6">
              <p class="text-sm font-medium text-slate-600">
                Works with your existing website or app. Just a few lines of
                code to start accepting payments.
              </p>
              <div class="mt-6 flex items-center gap-4">
                <a
                  href="https://github.com/ldclabs/1paying-kit"
                  target="_blank"
                  class="text-sm font-bold text-sky-600 hover:underline"
                  >View Documentation →</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen bg-slate-50/50 py-16 lg:py-24"
    >
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn class="text-center">
          <p class="text-xs font-bold tracking-[0.3em] text-sky-600 uppercase"
            >Platform Features</p
          >
          <h2
            class="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            Everything you need to build a paid service.
          </h2>
        </div>
        <div
          use:staggerChildren
          class="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {#each developerHighlights as feature}
            <article
              class="group rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-sky-100 hover:bg-sky-50/30 hover:shadow-lg hover:shadow-sky-500/5"
            >
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-slate-900">{feature.title}</h3
                >
                <span
                  class="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold tracking-wider text-sky-600 uppercase group-hover:bg-sky-500 group-hover:text-white"
                >
                  {feature.badge}
                </span>
              </div>
              <p class="mt-4 text-sm leading-relaxed text-slate-600"
                >{feature.description}</p
              >
            </article>
          {/each}
        </div>
      </div>
    </section>

    <section
      id="tokenomics"
      use:neuralGrid={{ palette: 'blue' }}
      class="relative min-h-screen py-16 lg:py-24"
    >
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,rgba(99,102,241,0.08),transparent_70%)]"
      ></div>
      <div use:parallax class="mx-auto max-w-6xl px-6">
        <div use:fadeIn>
          <p class="text-xs font-bold tracking-[0.3em] text-sky-600 uppercase"
            >The PAY Token</p
          >
          <h2
            class="mt-6 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            The fuel for the new economy.
          </h2>
          <p class="mt-6 max-w-3xl text-lg text-slate-600">
            <span class="font-outfit font-bold text-slate-900">PAY</span> (<a
              href="https://solscan.io/token/PAYiNGqaLFRdBomkQY3JXZeCm7wzK7hKuhrJDzcZBWN"
              target="1PayingToken"
              class="inline-flex flex-row items-center align-middle text-xs font-bold text-sky-600 hover:text-sky-500"
            >
              <img
                src="/_assets/images/sol.webp"
                alt="Solana"
                class="mr-1.5 inline-block size-4 rounded-full align-middle"
              />
              <span>PAYiNG...ZBWN</span>
              <span class="ml-0.5 *:size-3.5"><ArrowRightUpLine /></span>
            </a>) is the utility token that powers
            <span class="font-outfit font-bold text-slate-900">1Pay.ing</span>.
            It aligns the interests of users, developers, and the platform
            itself.
          </p>
        </div>
        <div use:staggerChildren class="mt-16 grid gap-6 md:grid-cols-2">
          {#each tokenFlywheels as flywheel}
            <article
              class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-lg"
            >
              <h3 class="text-xl font-bold text-slate-900">{flywheel.title}</h3>
              <p class="mt-4 leading-relaxed text-slate-600"
                >{flywheel.description}</p
              >
            </article>
          {/each}
        </div>

        <div class="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div
            use:fadeIn={{ delay: 100 }}
            class="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-slate-50/50 p-10 shadow-inner"
          >
            <div class="relative w-full max-w-xs">
              <svg
                viewBox="0 0 200 200"
                role="img"
                aria-label="PAY token allocation pie chart"
                class="h-auto w-full drop-shadow-2xl"
              >
                {#each tokenAllocationSlices as slice}
                  <path
                    d={slice.path}
                    fill={slice.color}
                    stroke="white"
                    stroke-width="2"
                    class="allocation-slice"
                  />
                {/each}
                <circle
                  cx={tokenAllocationChartCenter}
                  cy={tokenAllocationChartCenter}
                  r={tokenAllocationChartInnerRadius}
                  fill="white"
                />
                <text
                  x={tokenAllocationChartCenter}
                  y={tokenAllocationChartCenter - 6}
                  text-anchor="middle"
                  class="fill-slate-900 text-[10px] font-bold tracking-widest uppercase"
                >
                  {tokenAllocationTotal.label}
                </text>
                <text
                  x={tokenAllocationChartCenter}
                  y={tokenAllocationChartCenter + 14}
                  text-anchor="middle"
                  class="font-outfit fill-sky-600 text-lg font-bold"
                >
                  {tokenAllocationTotal.value}
                </text>
              </svg>
            </div>
            <p
              class="mt-8 max-w-sm text-center text-xs font-medium text-slate-400"
            >
              {tokenAllocationTotal.description}
            </p>
            <ul class="mt-10 w-full space-y-4">
              {#each tokenAllocationSlices as slice}
                <li
                  class="flex items-center justify-between rounded-xl border border-transparent bg-white/50 p-3 transition-all hover:border-slate-100 hover:bg-white"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="h-3 w-3 flex-none rounded-full shadow-sm"
                      style={`background-color: ${slice.color};`}
                    ></span>
                    <span class="text-sm font-bold text-slate-700"
                      >{slice.label}</span
                    >
                  </div>
                  <span class="font-outfit text-xs font-bold text-slate-500"
                    >{slice.value}</span
                  >
                </li>
              {/each}
            </ul>
          </div>
          <div use:staggerChildren class="flex flex-col gap-6">
            {#each tokenUtilities as utility}
              <article
                class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold text-slate-900"
                    >{utility.title}</h3
                  >
                  <span
                    class="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-bold tracking-wider text-sky-600 uppercase"
                  >
                    {utility.badge}
                  </span>
                </div>
                <ul class="mt-6 space-y-4">
                  {#each utility.points as point}
                    <li class="flex items-start gap-3">
                      <div
                        class="mt-1 flex size-5 flex-none items-center justify-center rounded-full bg-sky-50 text-sky-600"
                      >
                        <svg
                          class="size-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </div>
                      <span class="text-sm leading-relaxed text-slate-600"
                        >{point}</span
                      >
                    </li>
                  {/each}
                </ul>
              </article>
            {/each}
            <div class="grid gap-4 sm:grid-cols-2">
              {#each tokenLaunchPlan as item}
                <article
                  class="rounded-2xl border border-slate-100 bg-slate-50/50 p-6"
                >
                  <h3 class="text-base font-bold text-slate-900"
                    >{item.title}</h3
                  >
                  <p class="mt-2 text-sm leading-relaxed text-slate-600"
                    >{item.description}</p
                  >
                </article>
              {/each}
            </div>
          </div>
        </div>

        <div class="mt-12">
          <article
            class="overflow-hidden rounded-3xl border border-slate-100 bg-white p-10 shadow-xl"
          >
            <h3 class="text-2xl font-bold text-slate-900">
              The Growth Cycle
            </h3>
            <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {#each tokenFlywheelLoop as step, index}
                <div class="relative">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex size-8 flex-none items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white shadow-lg shadow-sky-200"
                    >
                      {index + 1}
                    </span>
                    {#if index < tokenFlywheelLoop.length - 1}
                      <div class="hidden h-px flex-1 bg-slate-100 lg:block"
                      ></div>
                    {/if}
                  </div>
                  <p
                    class="mt-4 text-sm leading-relaxed font-medium text-slate-600"
                  >
                    {step.split(': ')[1]}
                  </p>
                  <p
                    class="mt-1 text-[10px] font-bold tracking-wider text-sky-600 uppercase"
                  >
                    {step.split(': ')[0]}
                  </p>
                </div>
              {/each}
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="contact" class="py-16 lg:py-24">
      <div class="mx-auto max-w-5xl px-6">
        <div
          use:fadeIn
          class="relative overflow-hidden rounded-4xl bg-slate-900 p-12 text-center shadow-2xl lg:p-20"
        >
          <div
            class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.2),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]"
          ></div>
          <p class="text-xs font-bold tracking-[0.3em] text-sky-400 uppercase"
            >Join the Revolution</p
          >
          <h2
            class="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Ready to experience the <br /> future of payments?
          </h2>
          <p class="mx-auto mt-8 max-w-2xl text-lg text-slate-400">
            Whether you are a user, a creator, or a developer, there is a place
            for you in the 1Pay.ing ecosystem.
          </p>
          <div class="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              class="inline-flex h-14 items-center justify-center rounded-full bg-sky-500 px-10 text-base font-bold text-white transition-all hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/25 active:scale-95"
              href="https://github.com/ldclabs/1paying-kit"
              target="1PayingKit"
            >
              Start Building
            </a>
            <a
              class="inline-flex h-14 items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 px-10 text-base font-bold text-white backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800 active:scale-95"
              href="https://x.com/1Paying"
              target="1PayingCommunity"
            >
              Join Community
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer use:fadeIn class="border-t border-slate-100 bg-white py-16">
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <div class="col-span-1 lg:col-span-1">
          <div class="flex items-center gap-2">
            <img
              src="/_assets/logo.webp"
              alt="1Pay.ing"
              class="size-8 rounded-lg"
            />
            <span class="font-outfit text-xl font-bold text-slate-900"
              >1Pay.ing</span
            >
          </div>
          <p class="mt-6 text-sm leading-relaxed text-slate-500">
            The universal wallet for the new economy. Pay pennies for exactly
            what you consume.
          </p>
          <div class="mt-8 space-y-2 text-xs font-medium text-slate-400">
            <p>© {new Date().getFullYear()} 1Pay.ing. All rights reserved.</p>
            <p>
              Open source on
              <a
                href="https://github.com/ldclabs/1paying"
                target="1PayingGithub"
                class="text-sky-600 hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>
        {#each footerColumns as column}
          <div>
            <h3
              class="text-xs font-bold tracking-widest text-slate-900 uppercase"
              >{column.title}</h3
            >
            <ul class="mt-6 space-y-4 text-sm text-slate-500">
              {#each column.links as link}
                <li>
                  <a
                    class="transition-colors hover:text-sky-600"
                    href={link.href}
                    target={'View' + link.label}>{link.label}</a
                  >
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </footer>
</div>

<style>
  .allocation-slice {
    cursor: pointer;
    transform-box: fill-box;
    transform-origin: center;
    transition:
      transform 180ms ease,
      filter 180ms ease;
  }

  .allocation-slice:hover {
    transform: scale(1.05);
    filter: brightness(1.12);
  }
</style>

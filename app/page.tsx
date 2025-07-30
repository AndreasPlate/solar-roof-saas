export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Solar Roof SaaS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Optimize solar panel layouts using Google Maps roof analysis
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="text-left space-y-2">
              <li>✅ Google Maps roof imagery analysis</li>
              <li>✅ Obstacle detection and mapping</li>
              <li>✅ Optimal solar panel layout generation</li>
              <li>✅ Multi-tenant SaaS architecture</li>
              <li>✅ Stripe billing integration</li>
              <li>✅ Team management</li>
              <li>✅ Analytics dashboard</li>
              <li>✅ Admin panel</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
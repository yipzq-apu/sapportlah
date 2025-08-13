import Link from 'next/link';

export default function FeaturedCampaigns() {
  const campaigns = [
    {
      id: 1,
      title: "Clean Water for Rural Communities",
      description: "Help us bring clean drinking water to underserved rural areas.",
      goal: 50000,
      raised: 32500,
      image: "/api/placeholder/300/200"
    },
    {
      id: 2,
      title: "Education Technology for Schools",
      description: "Providing tablets and internet access to students in need.",
      goal: 25000,
      raised: 18750,
      image: "/api/placeholder/300/200"
    },
    {
      id: 3,
      title: "Emergency Medical Equipment",
      description: "Supporting local hospitals with essential medical equipment.",
      goal: 75000,
      raised: 45000,
      image: "/api/placeholder/300/200"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Campaigns
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing projects from creators around the world and help make them happen.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <img src={campaign.image} alt={campaign.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-4">{campaign.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Raised: ${campaign.raised.toLocaleString()}</span>
                    <span>Goal: ${campaign.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <Link href={`/campaign/${campaign.id}`} className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300">
                  View Campaign
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/campaigns" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300">
            View All Campaigns
          </Link>
        </div>
      </div>
    </section>
  );
}

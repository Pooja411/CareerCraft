// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Bookmark, MapPin, Users, Globe } from "lucide-react"

// interface Company {
//   id: string
//   name: string
//   field: string
//   location: string
//   employees: string
//   website: string
//   description: string
//   founded: number
// }

// const companies: Company[] = [
//   {
//     id: "1",
//     name: "Google",
//     field: "Full Stack",
//     location: "Mountain View, CA",
//     employees: "190,000+",
//     website: "google.com",
//     description: "Search, cloud, and AI technology leader",
//     founded: 1998,
//   },
//   {
//     id: "2",
//     name: "DeepMind",
//     field: "Data Science",
//     location: "London, UK",
//     employees: "1,000+",
//     website: "deepmind.com",
//     description: "AI research and development",
//     founded: 2010,
//   },
//   {
//     id: "3",
//     name: "OpenAI",
//     field: "Data Science",
//     location: "San Francisco, CA",
//     employees: "500+",
//     website: "openai.com",
//     description: "AI safety and research",
//     founded: 2015,
//   },
//   {
//     id: "4",
//     name: "Polygon",
//     field: "Web3",
//     location: "Remote",
//     employees: "100+",
//     website: "polygon.technology",
//     description: "Ethereum scaling solutions",
//     founded: 2017,
//   },
//   {
//     id: "5",
//     name: "Chainlink",
//     field: "Web3",
//     location: "Remote",
//     employees: "200+",
//     website: "chain.link",
//     description: "Decentralized oracle network",
//     founded: 2014,
//   },
//   {
//     id: "6",
//     name: "Meta",
//     field: "Full Stack",
//     location: "Menlo Park, CA",
//     employees: "67,000+",
//     website: "meta.com",
//     description: "Social media and metaverse",
//     founded: 2004,
//   },
//   {
//     id: "7",
//     name: "Databricks",
//     field: "Data Science",
//     location: "San Francisco, CA",
//     employees: "1,000+",
//     website: "databricks.com",
//     description: "Data and AI platform",
//     founded: 2013,
//   },
//   {
//     id: "8",
//     name: "Stripe",
//     field: "Full Stack",
//     location: "San Francisco, CA",
//     employees: "8,000+",
//     website: "stripe.com",
//     description: "Payment processing platform",
//     founded: 2010,
//   },
//   {
//     id: "9",
//     name: "Apple",
//     field: "Full Stack",
//     location: "Cupertino, CA",
//     employees: "161,000+",
//     website: "apple.com",
//     description: "Consumer electronics and software",
//     founded: 1976,
//   },
//   {
//     id: "10",
//     name: "Microsoft",
//     field: "Full Stack",
//     location: "Redmond, WA",
//     employees: "221,000+",
//     website: "microsoft.com",
//     description: "Cloud computing and enterprise software",
//     founded: 1975,
//   },
//   {
//     id: "11",
//     name: "Amazon",
//     field: "Full Stack",
//     location: "Seattle, WA",
//     employees: "1,540,000+",
//     website: "amazon.com",
//     description: "E-commerce and cloud services",
//     founded: 1994,
//   },
//   {
//     id: "12",
//     name: "Tesla",
//     field: "Full Stack",
//     location: "Palo Alto, CA",
//     employees: "127,855+",
//     website: "tesla.com",
//     description: "Electric vehicles and energy",
//     founded: 2003,
//   },
//   {
//     id: "13",
//     name: "Hugging Face",
//     field: "Data Science",
//     location: "New York, NY",
//     employees: "200+",
//     website: "huggingface.co",
//     description: "Open-source ML and NLP models",
//     founded: 2016,
//   },
//   {
//     id: "14",
//     name: "Anthropic",
//     field: "Data Science",
//     location: "San Francisco, CA",
//     employees: "300+",
//     website: "anthropic.com",
//     description: "AI safety and research",
//     founded: 2021,
//   },
//   {
//     id: "15",
//     name: "Uniswap",
//     field: "Web3",
//     location: "Remote",
//     employees: "50+",
//     website: "uniswap.org",
//     description: "Decentralized exchange protocol",
//     founded: 2018,
//   },
//   {
//     id: "16",
//     name: "Aave",
//     field: "Web3",
//     location: "Remote",
//     employees: "100+",
//     website: "aave.com",
//     description: "Decentralized lending protocol",
//     founded: 2017,
//   },
// ]

// const fields = ["All", "Full Stack", "Data Science", "Web3"]

// export default function CompaniesDirectory() {
//   const [selectedField, setSelectedField] = useState("All")
//   const [searchQuery, setSearchQuery] = useState("")
//   const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

//   const filteredCompanies = companies.filter((company) => {
//     const matchesField = selectedField === "All" || company.field === selectedField
//     const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())
//     return matchesField && matchesSearch
//   })

//   const toggleBookmark = (id: string) => {
//     const newBookmarked = new Set(bookmarked)
//     if (newBookmarked.has(id)) {
//       newBookmarked.delete(id)
//     } else {
//       newBookmarked.add(id)
//     }
//     setBookmarked(newBookmarked)
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold mb-2">Tech Companies Directory</h1>
//         <p className="text-muted-foreground">Explore leading tech companies by field and discover opportunities</p>
//       </div>

//       {/* Filters */}
//       <div className="space-y-4">
//         <div>
//           <label className="text-sm font-medium mb-2 block">Search Companies</label>
//           <Input
//             placeholder="Search by company name..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="max-w-md"
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium mb-2 block">Filter by Field</label>
//           <div className="flex gap-2 flex-wrap">
//             {fields.map((field) => (
//               <Button
//                 key={field}
//                 variant={selectedField === field ? "default" : "outline"}
//                 onClick={() => setSelectedField(field)}
//                 size="sm"
//               >
//                 {field}
//               </Button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Companies Grid */}
//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredCompanies.map((company) => (
//           <Card key={company.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <CardTitle className="text-lg">{company.name}</CardTitle>
//                   <Badge className="mt-2">{company.field}</Badge>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={() => toggleBookmark(company.id)}
//                   className={bookmarked.has(company.id) ? "text-yellow-500" : ""}
//                 >
//                   <Bookmark className="h-4 w-4" fill={bookmarked.has(company.id) ? "currentColor" : "none"} />
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <p className="text-sm text-muted-foreground">{company.description}</p>

//               <div className="space-y-2 text-sm">
//                 <div className="flex items-center gap-2">
//                   <MapPin className="h-4 w-4 text-muted-foreground" />
//                   <span>{company.location}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Users className="h-4 w-4 text-muted-foreground" />
//                   <span>{company.employees}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Globe className="h-4 w-4 text-muted-foreground" />
//                   <a
//                     href={`https://${company.website}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-500 hover:underline"
//                   >
//                     {company.website}
//                   </a>
//                 </div>
//               </div>

//               <div className="pt-2 border-t text-xs text-muted-foreground">Founded {company.founded}</div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filteredCompanies.length === 0 && (
//         <Card>
//           <CardContent className="py-8 text-center text-muted-foreground">
//             No companies found matching your criteria
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }


"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bookmark, MapPin, Users, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Job {
  title: string
  location: string
  description: string
  apply_link: string
}

interface Company {
  id: string
  name: string
  field: string
  location: string
  employees: string
  website: string
  description: string
  founded: number
}

const companies: Company[] = [
  { id: "1", name: "Google", field: "Full Stack", location: "Mountain View, CA", employees: "190,000+", website: "google.com", description: "Search, cloud, and AI technology leader", founded: 1998 },
  { id: "2", name: "DeepMind", field: "Data Science", location: "London, UK", employees: "1,000+", website: "deepmind.com", description: "AI research and development", founded: 2010 },
  { id: "3", name: "OpenAI", field: "Data Science", location: "San Francisco, CA", employees: "500+", website: "openai.com", description: "AI safety and research", founded: 2015 },
  { id: "4", name: "Polygon", field: "Web3", location: "Remote", employees: "100+", website: "polygon.technology", description: "Ethereum scaling solutions", founded: 2017 },
  { id: "5", name: "Chainlink", field: "Web3", location: "Remote", employees: "200+", website: "chain.link", description: "Decentralized oracle network", founded: 2014 },
  { id: "6", name: "Meta", field: "Full Stack", location: "Menlo Park, CA", employees: "67,000+", website: "meta.com", description: "Social media and metaverse", founded: 2004 },
  { id: "7", name: "Databricks", field: "Data Science", location: "San Francisco, CA", employees: "1,000+", website: "databricks.com", description: "Data and AI platform", founded: 2013 },
  { id: "8", name: "Stripe", field: "Full Stack", location: "San Francisco, CA", employees: "8,000+", website: "stripe.com", description: "Payment processing platform", founded: 2010 },
  { id: "9", name: "Apple", field: "Full Stack", location: "Cupertino, CA", employees: "161,000+", website: "apple.com", description: "Consumer electronics and software", founded: 1976 },
  { id: "10", name: "Microsoft", field: "Full Stack", location: "Redmond, WA", employees: "221,000+", website: "microsoft.com", description: "Cloud computing and enterprise software", founded: 1975 },
  { id: "11", name: "Amazon", field: "Full Stack", location: "Seattle, WA", employees: "1,540,000+", website: "amazon.com", description: "E-commerce and cloud services", founded: 1994 },
  { id: "12", name: "Tesla", field: "Full Stack", location: "Palo Alto, CA", employees: "127,855+", website: "tesla.com", description: "Electric vehicles and energy", founded: 2003 },
  { id: "13", name: "Hugging Face", field: "Data Science", location: "New York, NY", employees: "200+", website: "huggingface.co", description: "Open-source ML and NLP models", founded: 2016 },
  { id: "14", name: "Anthropic", field: "Data Science", location: "San Francisco, CA", employees: "300+", website: "anthropic.com", description: "AI safety and research", founded: 2021 },
  { id: "15", name: "Uniswap", field: "Web3", location: "Remote", employees: "50+", website: "uniswap.org", description: "Decentralized exchange protocol", founded: 2018 },
  { id: "16", name: "Aave", field: "Web3", location: "Remote", employees: "100+", website: "aave.com", description: "Decentralized lending protocol", founded: 2017 },
]

const fields = ["All", "Full Stack", "Data Science", "Web3"]

export default function CompaniesDirectory() {
  const [selectedField, setSelectedField] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set())

  const [jobsModalOpen, setJobsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])

  const fetchJobs = async (company: string) => {
    setSelectedCompany(company)
    setJobsModalOpen(true)
    setLoadingJobs(true)

    let query = "software engineer"
    if (company === "Google") query = "software engineer"
    if (company === "Meta") query = "full stack"
    if (company === "OpenAI") query = "ml engineer"

    try {
      const res = await fetch(`http://localhost:8000/companies/google/hiring`)
      const data = await res.json()
      setJobs(data.roles)
    } catch (err) {
      console.error(err)
    }

    setLoadingJobs(false)
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesField = selectedField === "All" || company.field === selectedField
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesField && matchesSearch
  })

  const toggleBookmark = (id: string) => {
    const newBookmarked = new Set(bookmarked)
    if (newBookmarked.has(id)) newBookmarked.delete(id)
    else newBookmarked.add(id)
    setBookmarked(newBookmarked)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tech Companies Directory</h1>
        <p className="text-muted-foreground">Explore leading tech companies and discover opportunities</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search Companies</label>
          <Input
            placeholder="Search by company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Field</label>
          <div className="flex gap-2 flex-wrap">
            {fields.map((field) => (
              <Button
                key={field}
                variant={selectedField === field ? "default" : "outline"}
                onClick={() => setSelectedField(field)}
                size="sm"
              >
                {field}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <Badge className="mt-2">{company.field}</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(company.id)}
                  className={bookmarked.has(company.id) ? "text-yellow-500" : ""}
                >
                  <Bookmark className="h-4 w-4" fill={bookmarked.has(company.id) ? "currentColor" : "none"} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{company.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{company.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{company.employees}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://${company.website}`} target="_blank" className="text-blue-500 hover:underline">
                    {company.website}
                  </a>
                </div>
              </div>

              <Button className="w-full mt-3" onClick={() => fetchJobs(company.name)}>
                View Hiring Roles
              </Button>

              <div className="pt-2 border-t text-xs text-muted-foreground">Founded {company.founded}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={jobsModalOpen} onOpenChange={setJobsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCompany} — Hiring Roles</DialogTitle>
          </DialogHeader>

          {loadingJobs ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p>No active roles found.</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {jobs.map((job, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                    <a 
                      href={job.apply_link}
                      target="_blank"
                      className="text-blue-500 underline text-sm"
                    >
                      Apply Here
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

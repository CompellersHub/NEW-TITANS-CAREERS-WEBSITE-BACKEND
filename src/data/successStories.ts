export interface SuccessStory {
  id: string;
  name: string;
  role: string;
  company: string;
  story: string;
  image: string;
  previousRole?: string;
  salary?: string;
}

export const successStories: SuccessStory[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "AML Analyst",
    company: "HSBC",
    story: "After completing the AML course, I landed my dream job within 6 weeks. The practical training made all the difference.",
    image: "/placeholder.svg",
    previousRole: "Retail Manager",
    salary: "£35,000"
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Crypto Compliance Officer",
    company: "Coinbase",
    story: "The crypto compliance course gave me the specialized knowledge needed to break into this exciting field.",
    image: "/placeholder.svg",
    previousRole: "Banking Associate",
    salary: "£55,000"
  },
  {
    id: "3",
    name: "Emma Williams",
    role: "Data Analyst",
    company: "Amazon",
    story: "The hands-on projects and career support helped me transition from hospitality to tech successfully.",
    image: "/placeholder.svg",
    previousRole: "Restaurant Manager",
    salary: "£45,000"
  }
];

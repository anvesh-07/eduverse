export type Content = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  tags: string[];
};

export const contentData: Content[] = [
  {
    id: "1",
    title: "Intro to Python for Data Science",
    description: "Learn the fundamentals of Python programming and its applications in data science.",
    imageId: "1",
    tags: ["Programming", "Python", "Data Science"],
  },
  {
    id: "2",
    title: "History of Ancient Rome",
    description: "Explore the rise and fall of the Roman Empire, from its origins to its collapse.",
    imageId: "2",
    tags: ["History", "Ancient Civilizations", "Rome"],
  },
  {
    id: "3",
    title: "The Science of Climate Change",
    description: "Understand the scientific principles behind climate change and its global impact.",
    imageId: "3",
    tags: ["Science", "Environment", "Climate Change"],
  },
  {
    id: "4",
    title: "Basics of Graphic Design",
    description: "A beginner's guide to the principles of visual communication and design.",
    imageId: "4",
    tags: ["Design", "Art", "Creativity"],
  },
  {
    id: "5",
    title: "Introduction to Machine Learning",
    description: "Grasp the core concepts of machine learning and build your first predictive models.",
    imageId: "5",
    tags: ["Technology", "AI", "Machine Learning"],
  },
  {
    id: "6",
    title: "Creative Writing Workshop",
    description: "Unlock your storytelling potential with this workshop on narrative techniques.",
    imageId: "6",
    tags: ["Writing", "Literature", "Creativity"],
  },
];

export const allTags = [...new Set(contentData.flatMap((item) => item.tags))].sort();

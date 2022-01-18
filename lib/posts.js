import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
  //get filename under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map(filename => {
    //remove .md from filename to get id
    const id = filename.replace(/\.md$/, '')

    //read markdown as a string
    const fullPath = path.join(postsDirectory, filename)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')

    //use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    //combine the data with the id
    return {
      id,
      ...matterResult.data
    }
  })

  //sort posts by date
  return allPostsData.sort(({date: a}, {date: b}) => {
    if (a < b) {
      return 1
    } else if (a > b) {
      return -1
    } else {
      return 0
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]

  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf-8')

  //use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  const processedContent = await remark() 
    .use(html)
    .process(matterResult.content)

  const contentHtml = processedContent.toString()

  //combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}
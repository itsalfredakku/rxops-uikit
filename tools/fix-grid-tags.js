import { promises as fs } from 'fs';

const filePath = '/Volumes/EXT/RxOps/ui/src/healthcare/patient/health-dashboard/health-dashboard.migrated.tsx';

async function fixGridTags() {
  try {
    console.log(`Fixing Grid closing tags in ${filePath}`);
    let content = await fs.readFile(filePath, 'utf8');
    
    // Find all instances where </div> should be </Grid>
    content = content.replace(/<Grid cols=\{(.*?)\} gap="(.*?)">([\s\S]*?)<\/div>/g, function(match, cols, gap, content) {
      return `<Grid cols={${cols}} gap="${gap}">${content}</Grid>`;
    });
    
    // Write back the fixed content
    await fs.writeFile(filePath, content, 'utf8');
    console.log('Fixed Grid closing tags successfully');
  } catch (error) {
    console.error('Error fixing Grid tags:', error);
  }
}

fixGridTags();

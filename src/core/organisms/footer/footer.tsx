import { component$ } from '@builder.io/qwik';
import { Footer } from './index';
import { Text } from '../../atoms/text/text';
import { Icon } from '../../atoms/icon';
import { Container } from '../container/container';
import { List, ListItem } from '../list/list';

export default component$(() => {
  const data = {
    title: 'Footer',
    description: 'Flexible footer component with multiple layout variants for different use cases',
  };

  return (
    <Container size="xl" padding="6">
      <div class="mb-8">
        <Text as="h1" size="xl" weight="bold" class="mb-2">{data.title}</Text>
        <Text as="p" color="gray-600">{data.description}</Text>
      </div>

      <div class="space-y-8">
        {/* Public Footer */}
        <section>
          <Text as="h2" size="lg" weight="semibold" class="mb-4">Public Footer</Text>
          <div class="border rounded-lg bg-white">
            <Footer variant="public">
              <div slot="brand">
                <Text as="h3" size="lg" weight="bold" class="mb-2">RxOps</Text>
                <Text as="p" color="gray-400" class="mb-4">
                  Comprehensive healthcare management platform connecting patients, 
                  providers, and healthcare organizations.
                </Text>
                <Text as="p" size="sm" color="gray-500">
                  Making healthcare accessible, efficient, and patient-centered.
                </Text>
              </div>
              
              <div slot="content">
                <div>
                  <Text as="h4" weight="semibold" class="mb-3">For Patients</Text>
                  <List variant="none" size="sm" class="text-neutral-400">
                    <ListItem><a href="#" class="hover:text-white transition-colors">Find Doctors</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Book Appointments</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Health Records</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Telemedicine</a></ListItem>
                  </List>
                </div>
                
                <div>
                  <Text as="h4" weight="semibold" class="mb-3">For Providers</Text>
                  <List variant="none" size="sm" class="text-neutral-400">
                    <ListItem><a href="#" class="hover:text-white transition-colors">Practice Management</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Patient Portal</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Analytics</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Integration</a></ListItem>
                  </List>
                </div>
                
                <div>
                  <Text as="h4" weight="semibold" class="mb-3">Company</Text>
                  <List variant="none" size="sm" class="text-neutral-400">
                    <ListItem><a href="#" class="hover:text-white transition-colors">About Us</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Careers</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Press</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Contact</a></ListItem>
                  </List>
                </div>
                
                <div>
                  <Text as="h4" weight="semibold" class="mb-3">Support</Text>
                  <List variant="none" size="sm" class="text-neutral-400">
                    <ListItem><a href="#" class="hover:text-white transition-colors">Help Center</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Privacy</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Terms</a></ListItem>
                    <ListItem><a href="#" class="hover:text-white transition-colors">Security</a></ListItem>
                  </List>
                </div>
              </div>
              
              <div slot="apps">
                <Text as="h4" weight="semibold" class="mb-3">Download Our Apps</Text>
                <div class="flex space-x-3">
                  <button class="px-4 py-2 bg-neutral-800 rounded text-sm transition-colors duration-200 hover:bg-neutral-700 transition-colors flex items-center space-x-2">
                    <Icon icon="smartphone" class="w-4 h-4" />
                    <span>iOS App</span>
                  </button>
                  <button class="px-4 py-2 bg-neutral-800 rounded text-sm transition-colors duration-200 hover:bg-neutral-700 transition-colors flex items-center space-x-2">
                    <Icon icon="monitor" class="w-4 h-4" />
                    <span>Android App</span>
                  </button>
                </div>
              </div>
              
              <div slot="newsletter">
                <Text as="h4" weight="semibold" class="mb-3">Stay Updated</Text>
                <Text as="p" size="sm" color="gray-400" class="mb-3">
                  Get the latest healthcare insights and platform updates.
                </Text>
                <div class="flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    class="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-l text-sm"
                  />
                  <button class="px-4 py-2 bg-primary-600 transition-colors duration-200 hover:bg-primary-700 rounded-r text-sm transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
              
              <div slot="bottom">
                <div class="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-400">
                  <Text as="p">© 2024 RxOps. All rights reserved.</Text>
                  <div class="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" class="hover:text-white transition-colors">Cookie Policy</a>
                  </div>
                </div>
              </div>
            </Footer>
          </div>
        </section>

        {/* Simple Footer */}
        <section>
          <Text as="h2" weight="semibold" size="lg" class="mb-4">Simple Footer</Text>
          <div class="border rounded-lg bg-white">
            <Footer variant="simple">
              <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="flex items-center space-x-8 mb-4 md:mb-0">
                  <Text as="h3" weight="bold" size="md">RxOps</Text>
                  <nav class="flex space-x-6 text-sm">
                    <a href="#" class="text-neutral-400 hover:text-white transition-colors">About</a>
                    <a href="#" class="text-neutral-400 hover:text-white transition-colors">Contact</a>
                    <a href="#" class="text-neutral-400 hover:text-white transition-colors">Privacy</a>
                    <a href="#" class="text-neutral-400 hover:text-white transition-colors">Terms</a>
                  </nav>
                </div>
                <Text as="p" size="sm" color="gray-400">© 2024 RxOps. All rights reserved.</Text>
              </div>
              
              <div slot="bottom">
                <div class="text-center pt-4 border-t border-neutral-800">
                  <Text as="p" size="xs" color="gray-500">
                    Designed for healthcare professionals and patients worldwide
                  </Text>
                </div>
              </div>
            </Footer>
          </div>
        </section>

        {/* Minimal Footer */}
        <section>
          <Text as="h2" weight="semibold" size="lg" class="mb-4">Minimal Footer</Text>
          <div class="border rounded-lg bg-white">
            <Footer variant="minimal">
              <div class="text-center">
                <Text as="p" size="sm" color="gray-400">
                  © 2024 RxOps Healthcare Platform. Built with care for better health outcomes.
                </Text>
              </div>
            </Footer>
          </div>
        </section>

        {/* Code Example */}
        <section>
          <Text as="h2" weight="semibold" size="lg" class="mb-4">Code Example</Text>
          <div class="p-6 border rounded-lg bg-neutral-50">
            <pre class="text-sm overflow-x-auto">
              <code>{`import { Footer } from '@rxops/uikit';

// Public Footer with all sections
<Footer variant="public">
  <div slot="brand">
    <Text as="h3">RxOps</Text>
    <p>Healthcare management platform</p>
  </div>
  
  <div slot="content">
    <div>
      <Text as="h4">For Patients</Text>
      <List variant="none">
        <ListItem><a href="#">Find Doctors</a></ListItem>
        <ListItem><a href="#">Book Appointments</a></ListItem>
      </List>
    </div>
  </div>
  
  <div slot="bottom">
    <p>© 2024 RxOps. All rights reserved.</p>
  </div>
</Footer>

// Simple Footer
<Footer variant="simple">
  <div>
    <Text as="h3">RxOps</Text>
    <p>© 2024 All rights reserved.</p>
  </div>
</Footer>

// Minimal Footer
<Footer variant="minimal">
  <p>© 2024 RxOps Healthcare Platform</p>
</Footer>`}</code>
            </pre>
          </div>
        </section>
      </div>
    </Container>
  );
});

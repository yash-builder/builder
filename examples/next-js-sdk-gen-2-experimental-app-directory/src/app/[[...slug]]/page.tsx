import { Content, fetchOneEntry, getBuilderSearchParams } from '../../sdk';

interface MyPageProps {
  params: {
    slug: string[];
  };
  searchParams: Record<string, string>;
}

const apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660';

export default async function Page(props: MyPageProps) {
  // NOTE: the import must be inside the Page component itself.
  const { initializeNodeRuntime } = await import('../../sdk/functions/evaluate/node-runtime/init');
  initializeNodeRuntime();

  const urlPath = '/' + (props.params?.slug?.join('/') || '');

  const content = await fetchOneEntry({
    model: 'page',
    apiKey,
    options: getBuilderSearchParams(props.searchParams),
    userAttributes: { urlPath },
  });

  return (
    <>
      <div>This is the version of the SDK with `revalidatePath(window.location.pathname)`</div>
      <Content content={content} model="page" apiKey={apiKey} />
    </>
  );
}
export const revalidate = 1;

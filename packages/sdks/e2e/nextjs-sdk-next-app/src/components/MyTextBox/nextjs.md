- nextjs editing is too slow
- what if we do old-school visual editing for everything except user's custom components? is this possible?

create a "LiveEdit" component that is a wrapper around the component and adds live editing capabilities to it:

```tsx
const findBlockById = (builderContext: BuilderContext, id: string) => {
  // recursively check content
};

export default function LiveEdit(props: {
  component: React.ComponentType<any>;
  path: string;
  nonOptionProps: Record<string, any>;
}) {
  const builderContext = useContext(BuilderContext);

  // const componentOptions = get(builderContext, props.path);
  // OR
  const componentOptions = findBlockById(builderContext, props.builderBlock.id);

  return <props.component {...componentOptions} {...props.nonOptionProps} />;
}

export default function EditableTextBlock(props) {
  return (
    <LiveEdit
      component={TextBlock}
      path="[0].children[0].children[4]" // TO-DO: how do we get this?
      nonOptionProps={props}
    />
  );
}
```

We need to decide whether an incoming edit is going to request a `revalidatePath` call or not.

#1 no `revalidatePath`: this would be any change that would impact code within a Client Component, OR code that can _become_ part of a Client Component.

- Code already part of a client component by default: that's any Block that's a client component
- Code that can be wrapped in a `LiveEdit` client component: any RSC Block that can safely be wrapped.
  - built-in blocks: only 4 are RSCs
    - ✅ Text: can be wrapped in LiveEdit.
    - ❌ Symbol: it renders <Content> which needs to receive `customComponents` which include RSCs. Must Remain RSC
    - ❌ Columns, Slot: they render <Blocks>, so need to pass along `registeredComponents`. Must remain RSC
      - Columns: we could spin off a `ColumnsWrapper`, which renders the parent <div> and each column's <DynamicRenderer>, wrap _that_ in LiveEdit which will allow us to instantly edit _that_ part.
  - customer blocks: we will leave it up to the customer.
    - If `isRSC: false`, we can safely wrap in `LiveEdit`.
    - If it's an RSC, we add a `canBeLiveEdited` boolean that they can toggle on/off. If it's true, we wrap in `LiveEdit`. Documentation would explain that this can only be true if the RSC has no RSC-only abilities that prohibit it from being wrapped in a client component. This means:
      - no server actions
      - is not an `async` component
      - no `use server` in the component or any of its imports
      - no usage of <Blocks> or `props.registeredComponents`

#2 yes `revalidatePath`:

- anything that can't be part of #1:
  - updating inputs for RSC blocks
  - adding/removing blocks
  - updating non-blocks content data: global CSS/JS, Builder state, etc.

For changes in #2, we will need to improve the Content Editor UI. Choices:

- spinner: add global spinner indicating that path is being revalidated
- disable live editing: instead of live edits, add a "update" button somewhere in the UI and use that to revalidate path

import { ButtonWithTooltip, insertJsx$, usePublisher } from "@mdxeditor/editor";
import {
  BsTypeH1,
  BsTypeH2,
  BsTypeH3,
  BsTypeH4,
  BsTypeH5,
  BsTypeH6,
} from "react-icons/bs";
import { FaParagraph } from "react-icons/fa";
import { FaListOl, FaListUl } from "react-icons/fa6";
import { MdInsertLink } from "react-icons/md";
import { TbListTree, TbSection } from "react-icons/tb";

// a toolbar button that will insert a Link element into the editor.
export const InsertLink = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="لینک"
      onClick={() =>
        insertJsx({
          name: "CustomLink",
          kind: "text",
          props: {
            href: "",
          },
        })
      }
    >
      <MdInsertLink size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a UL element into the editor.
export const InsertUl = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="لیست بدون ترتیب"
      onClick={() =>
        insertJsx({
          name: "UnorderedList",
          kind: "flow",
          props: {},
        })
      }
    >
      <FaListUl />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a OL element into the editor.
export const InsertOl = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="لیست با ترتیب"
      onClick={() =>
        insertJsx({
          name: "OrderedList",
          kind: "flow",
          props: {},
        })
      }
    >
      <FaListOl />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a OL element into the editor.
export const InsertLi = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="گزینه لیست"
      onClick={() =>
        insertJsx({
          name: "ListItem",
          kind: "flow",
          props: {},
        })
      }
    >
      <TbListTree size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a OL element into the editor.
export const InsertSection = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="بخش"
      onClick={() =>
        insertJsx({
          name: "Section",
          kind: "flow",
          props: {},
        })
      }
    >
      <TbSection size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a Paragraph element into the editor.
export const InsertParagraph = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="پاراگراف"
      onClick={() =>
        insertJsx({
          name: "Paragraph",
          kind: "flow",
          props: {},
        })
      }
    >
      <FaParagraph />
    </ButtonWithTooltip>
  );
};
// a toolbar button that will insert a H1 element into the editor.
export const InsertH1 = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="H1"
      onClick={() =>
        insertJsx({
          name: "H1",
          kind: "flow",
          props: {},
        })
      }
    >
      <BsTypeH1 size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a H2 element into the editor.
export const InsertH2 = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="H2"
      onClick={() =>
        insertJsx({
          name: "H2",
          kind: "flow",
          props: {},
        })
      }
    >
      <BsTypeH2 size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a H3 element into the editor.
export const InsertH3 = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="H3"
      onClick={() =>
        insertJsx({
          name: "H3",
          kind: "flow",
          props: {},
        })
      }
    >
      <BsTypeH3 size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a H4 element into the editor.
export const InsertH4 = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="H4"
      onClick={() =>
        insertJsx({
          name: "H4",
          kind: "flow",
          props: {},
        })
      }
    >
      <BsTypeH4 size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a H5 element into the editor.
export const InsertH5 = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="H5"
      onClick={() =>
        insertJsx({
          name: "H5",
          kind: "flow",
          props: {},
        })
      }
    >
      <BsTypeH5 size={20} />
    </ButtonWithTooltip>
  );
};

// a toolbar button that will insert a H6 element into the editor.
export const InsertH6 = () => {
  const insertJsx = usePublisher(insertJsx$);
  return (
    <ButtonWithTooltip
      title="H6"
      onClick={() =>
        insertJsx({
          name: "H6",
          kind: "flow",
          props: {},
        })
      }
    >
      <BsTypeH6 size={20} />
    </ButtonWithTooltip>
  );
};

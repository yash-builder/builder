'use client';
import * as React from 'react';
import { useState } from 'react';
import Blocks from '../../components/blocks/blocks';
import type { BuilderBlock } from '../../types/builder-block';
import type { TabsProps } from './tabs.types';

function Tabs(props: TabsProps) {
  const [activeTab, setActiveTab] = useState(() =>
    props.defaultActiveTab ? props.defaultActiveTab - 1 : 0
  );

  function activeTabContent(active: number) {
    return props.tabs && props.tabs[active].content;
  }

  function onClick(index: number) {
    if (index === activeTab && props.collapsible) {
      setActiveTab(-1);
    } else {
      setActiveTab(index);
    }
  }

  return (
    <div>
      <div
        className="builder-tabs-wrap"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: props.tabHeaderLayout || 'flex-start',
          overflow: 'auto',
        }}
      >
        {props.tabs?.map((tab, index) => (
          <span
            key={index}
            className={`builder-tab-wrap ${activeTab === index ? 'builder-tab-active' : ''}`}
            style={{
              ...(activeTab === index ? props.activeTabStyle : {}),
            }}
            onClick={event => onClick(index)}
          >
            <Blocks
              parent={props.builderBlock.id}
              path={`tabs.${index}.label`}
              blocks={tab.label}
              context={props.builderContext}
              registeredComponents={props.builderComponents}
              linkComponent={props.builderLinkComponent}
            />
          </span>
        ))}
      </div>
      {activeTabContent(activeTab) ? (
        <div>
          <Blocks
            parent={props.builderBlock.id}
            path={`tabs.${activeTab}.content`}
            blocks={activeTabContent(activeTab)}
            context={props.builderContext}
            registeredComponents={props.builderComponents}
            linkComponent={props.builderLinkComponent}
          />
        </div>
      ) : null}
    </div>
  );
}

export default Tabs;

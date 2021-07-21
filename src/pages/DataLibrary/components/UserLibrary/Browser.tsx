import React, { useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import {
  Grid,
  GridItem,
  Card,
  CardBody,
  Split,
  SplitItem,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  TextInput,
  Modal,
} from "@patternfly/react-core";
import { FolderIcon } from '@patternfly/react-icons';
import pluralize from 'pluralize';

import DirectoryTree from "../../../../utils/browser";
import FileDetailView from '../../../../components/feed/Preview/FileDetailView';

interface BrowserProps {
  tree: DirectoryTree
  path: string
  name: string
}

export const BrowserBreadcrumbs = ({ path }: { path: string }) => {
  const pathtokens = path.split('/');
  return (
    <Breadcrumb>
      { pathtokens.map(( token, index ) => {
        if (!token) return null;

        if (index === pathtokens.length - 1)
          return <BreadcrumbItem key={token} to="#" isActive><b>{token}</b></BreadcrumbItem>

        return (
          <BreadcrumbItem key={token} to={ pathtokens.slice(0, index + 1).join('/') }>
            { token }
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
}

function elipses(str:string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len) + "...";
}

export const Browser: React.FC<BrowserProps> = ({ name, tree, path }: BrowserProps) => {
  const [filter, setFilter] = useState<string>();
  const [viewfile, setViewFile] = useState<any>();

  const folders = tree.dir
    .filter(({ hasChildren }) => hasChildren)
    .filter(({ name }) => {
      if (filter)
        return name.includes(filter)
      return true;
    });
  
  const files = tree.dir
    .filter(({ hasChildren }) => !hasChildren)
    .filter(({ name }) => {
      if (filter)
        return name.includes(filter)
      return true;
    });

  return (
    <Switch>
      <Route path={`${path}/:subfolder`} render={({ match }) => {
        return <Browser 
          name={match.params.subfolder}
          path={`${path}/${match.params.subfolder}`} 
          tree={tree.child(match.params.subfolder)}
        />
      }} />

      <Route>
        <article>
          <section>
            {
              path &&
              <div style={{ margin: "1em 0" }}>
                <BrowserBreadcrumbs path={path} />
              </div>
            }

            <Split>
              <SplitItem isFilled>
                <h2><FolderIcon/> { name }</h2>
                <h3>{ tree.dir.length } {pluralize('item', tree.dir.length)}</h3>
              </SplitItem>

              <SplitItem>
                <Card>
                  <TextInput id={`${path}-filter`}
                    placeholder="Filter by Name"
                    onChange={(value) => setFilter(value || undefined)} 
                  />
                </Card>
              </SplitItem>
            </Split>
          </section>

          <Grid hasGutter>
            { folders.map(({ name, children }) => (
              <GridItem key={name} sm={12} lg={4}>
                <Card isSelectable>
                  <CardBody>
                    <Split style={{ overflow: "hidden" }}>
                      <SplitItem style={{ marginRight: "1em" }}><FolderIcon/></SplitItem>
                      <SplitItem isFilled><Link to={`${path}/${name}`}>{elipses(name,28)}</Link></SplitItem>
                      <SplitItem>
                        <div>{children.length} {pluralize('item', children.length)}</div>
                      </SplitItem>
                    </Split>
                  </CardBody>
                </Card>
              </GridItem>
            ))}

            { files && <GridItem/> }

            { files.map(({ name, item }) => (
              <GridItem key={name} sm={12} lg={2}>
                <Card isSelectable onClick={() => setViewFile(item)}>
                  <CardBody>
                    <div style={{ margin: "-1.5em -1.5em 1em -1.5em", maxHeight: "10em", overflow: "hidden" }}>
                      <FileDetailView selectedFile={item} preview="small" />
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <Button variant="link" style={{ padding: "0" }}>
                        {elipses(name,20)}
                      </Button>
                    </div>
                    <div>{ (item.data.fsize/(1024*1024)).toFixed(3) } MB</div>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>

          <Modal 
            title="Preview"
            aria-label="viewer" 
            width={'50%'}
            isOpen={!!viewfile} 
            onClose={() => setViewFile(undefined)}
          >
            <FileDetailView selectedFile={viewfile} preview="large" />
          </Modal>
        </article>
      </Route>
    </Switch>
  )
}

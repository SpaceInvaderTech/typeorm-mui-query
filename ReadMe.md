# MUI TypeORM querybuilder

If you use [TypeORM](https://typeorm.io/) and [MUI](https://mui.com/) [Data Grid](https://mui.com/x/react-data-grid/) [server-side filter](https://mui.com/x/react-data-grid/filtering/server-side/) or [server-side sorting](https://mui.com/x/react-data-grid/sorting/#server-side-sorting) this project can be helpful.

## Install

    npm install typeorm-mui-query

## Example

### Frontend

```TSX
const [queryOptions, setQueryOptions] = useState({
  filterModel: {
    items: [],
  },
  sortModel: [],
})

const handleSortModelChange: DataGridProProps['onSortModelChange'] = useCallback((sortModel) => {
  setQueryOptions((currentState) => ({ ...currentState, sortModel }))
}, [])

const handleFilterModelChange: DataGridProProps['onFilterModelChange'] = useCallback(
  (filterModel) => {
    setQueryOptions((currentState) => ({ ...currentState, filterModel }))
  },
  []
)

const query = new URLSearchParams({
  ...queryOptions,
  sortModel: JSON.stringify(queryOptions.sortModel),
  filterModel: JSON.stringify(queryOptions.filterModel),
})
const results = await API.get('default', `/example?${query.toString()}`, {})
```

### Backend

```TypeScript
import {
  handleFilterAndSort,
  handleQueryStringParameters,
} from 'typeorm-mui-query'

const { filterModel, sortModel, offset, limit } = handleQueryStringParameters(
  queryStringParameters
)
handleFilterAndSort({ qb, filterModel, sortModel })
const results = await qb.take(limit).skip(offset).getMany()
```

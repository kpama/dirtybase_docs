---
outline: deep
---

# ORM 

Dirtybase ORM is a very thin layer over your model. A model in Database is struct that has one or more fields link to a database table column.

For example, a struct that represents a post table:
```rust
#[derive(Debug)]
struct Post {
   id: Option<i64>,
   title: String,
   content: String
}
```

Dirtybase expects the struct to derive `Default` and `DirtyTable`. 
```rust
#[derive(Debug, Default, DirtyTable)]
struct Post {
   id: Option<i64>,
   title: String,
   content: String
}
```

## The `DirtyTable` trait effects
 Deriving `DirtyTable` causes few things to happen. Understanding what really going on under the hood will help you to be more comfortable using Dirtybase.

 ### Multiple methods are implemented for the model
 For each field in the struct these static methods will be generated:
  - `col_name_for_[x]`: Gets the table column name for that field. For example, the field `title` will have the method `col_name_for_title()`
  that returns `title` as the column name.
    If the column name is different, use the `col` field of the `dirty` field attribute to specific the name:
    ```rust
    #[dirty(col=post_title)]
    title: String // col_name_for_title() will return "post_title"
    ```
  
  - `from_column_for_[x]`: Processes the `FieldValue` from a query. For example, the field `title` will have the method `from_column_for_title`.
  You can override the default implementation by implementing a static method on the model with the following declaration:
  ```rust
  // where X is the type of the field
  pub fn from_column_for_my_field<'a>(field: Option<&'a FieldValue>) -> Option<X> 
  ```
  Using the `from` field of the `dirty` field attribute, override the default implementation:
  ```rust
    #[dirty(from=from_column_for_my_field)]
    title: String
  ```

  - `into_column_for_[x]`: Transforms the field value into a `FieldValue`. For example, the field `title` will have the method `into_column_for_title`.
  You can override the default implementation by implementing a method on the model with the following declaration:
  ```rust
  pub fn into_column_for_my_field(&self) -> Option<FieldValue>;
  ```
  Use the `into` field on the `dirty` field attribute to register your implementation
  ```rust
    #[dirty(into=into_column_for_my_field)]
    title: String
  ```


 ### The `TableModel` is implemented for the model 
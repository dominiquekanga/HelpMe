//
// Copyright © 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import type { Employee } from '@hcengineering/contact'
import type {
  TestCase,
  TestSuite,
  TestCaseType,
  TestCasePriority,
  TestCaseStatus,
  TestProject,
  TestRun,
  TestRunResult,
  TestRunItem
} from '@hcengineering/test-management'
import { type Attachment } from '@hcengineering/attachment'
import contact from '@hcengineering/contact'
import chunter from '@hcengineering/chunter'
import { getEmbeddedLabel } from '@hcengineering/platform'
import {
  Account,
  DateRangeMode,
  IndexKind,
  type RolesAssignment,
  type Role,
  Ref,
  type Domain,
  type Timestamp,
  type Type,
  type CollectionSize,
  type CollaborativeDoc,
  type Class
} from '@hcengineering/core'
import {
  Mixin,
  Model,
  Prop,
  TypeRef,
  UX,
  TypeMarkup,
  Index,
  TypeCollaborativeDoc,
  TypeString,
  Collection,
  ReadOnly,
  TypeDate,
  Hidden
} from '@hcengineering/model'
import attachment from '@hcengineering/model-attachment'
import core, { TAttachedDoc, TDoc, TType, TTypedSpace } from '@hcengineering/model-core'

import testManagement from './plugin'

export { testManagementId } from '@hcengineering/test-management/src/index'

export const DOMAIN_TEST_MANAGEMENT = 'test-management' as Domain

/** @public */
export function TypeTestCaseType (): Type<TestCaseType> {
  return { _class: testManagement.class.TypeTestCaseType, label: testManagement.string.TestCaseType }
}

@Model(testManagement.class.TypeTestCaseType, core.class.Type, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestCaseType)
export class TTypeTestCaseType extends TType {}

/** @public */
export function TypeTestCasePriority (): Type<TestCasePriority> {
  return { _class: testManagement.class.TypeTestCasePriority, label: testManagement.string.TestCasePriority }
}

@Model(testManagement.class.TypeTestCasePriority, core.class.Type, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestCasePriority)
export class TTypeTestCasePriority extends TType {}

/** @public */
export function TypeTestCaseStatus (): Type<TestCaseStatus> {
  return { _class: testManagement.class.TypeTestCaseStatus, label: testManagement.string.TestCaseStatus }
}

@Model(testManagement.class.TypeTestCaseStatus, core.class.Type, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestCaseStatus)
export class TTypeTestCaseStatus extends TType {}

@Model(testManagement.class.TestProject, core.class.TypedSpace)
@UX(testManagement.string.TestProject)
export class TTestProject extends TTypedSpace implements TestProject {
  @Prop(TypeMarkup(), testManagement.string.FullDescription)
  @Index(IndexKind.FullText)
    fullDescription?: string
}

@Mixin(testManagement.mixin.DefaultProjectTypeData, testManagement.class.TestProject)
@UX(getEmbeddedLabel('Default project'), testManagement.icon.TestProject)
export class TDefaultProjectTypeData extends TTestProject implements RolesAssignment {
  [key: Ref<Role>]: Ref<Account>[]
}

/**
 * @public
 */
@Model(testManagement.class.TestSuite, core.class.Doc, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestSuite, testManagement.icon.TestSuite, testManagement.string.TestSuite)
export class TTestSuite extends TDoc implements TestSuite {
  @Prop(TypeString(), testManagement.string.SuiteName)
  @Index(IndexKind.FullText)
    name!: string

  @Prop(TypeMarkup(), testManagement.string.SuiteDescription)
  @Index(IndexKind.FullText)
    description?: string

  @Prop(TypeRef(testManagement.class.TestSuite), testManagement.string.TestSuite)
    parent!: Ref<TestSuite>

  @Prop(Collection(testManagement.class.TestCase), testManagement.string.TestCases, {
    shortLabel: testManagement.string.TestCase
  })
    testCases?: CollectionSize<TestCase>

  declare space: Ref<TestProject>
}

/**
 * @public
 */
@Model(testManagement.class.TestCase, core.class.AttachedDoc, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestCase, testManagement.icon.TestCase, testManagement.string.TestCase)
export class TTestCase extends TAttachedDoc implements TestCase {
  @Prop(TypeRef(testManagement.class.TestProject), core.string.Space)
  @Index(IndexKind.Indexed)
  @Hidden()
  declare space: Ref<TestProject>

  @Prop(TypeRef(testManagement.class.TestSuite), core.string.AttachedTo)
  @Index(IndexKind.Indexed)
  declare attachedTo: Ref<TestSuite>

  @Prop(TypeRef(testManagement.class.TestSuite), core.string.AttachedToClass)
  @Index(IndexKind.Indexed)
  @Hidden()
  declare attachedToClass: Ref<Class<TestSuite>>

  @Prop(TypeString(), core.string.Collection)
  @Hidden()
  override collection: 'testCases' = 'testCases'

  @Prop(TypeString(), testManagement.string.TestName)
  @Index(IndexKind.FullText)
    name!: string

  @Prop(TypeCollaborativeDoc(), testManagement.string.FullDescription)
  @Index(IndexKind.FullText)
    description!: CollaborativeDoc

  @Prop(TypeTestCaseType(), testManagement.string.TestType)
  @ReadOnly()
    type!: TestCaseType

  @Prop(TypeTestCasePriority(), testManagement.string.TestPriority)
  @ReadOnly()
    priority!: TestCasePriority

  @Prop(TypeTestCaseStatus(), testManagement.string.TestStatus)
  @ReadOnly()
    status!: TestCaseStatus

  @Prop(TypeRef(contact.mixin.Employee), testManagement.string.TestAssignee)
    assignee!: Ref<Employee>

  @Prop(Collection(attachment.class.Attachment), attachment.string.Attachments, { shortLabel: attachment.string.Files })
    attachments?: CollectionSize<Attachment>

  @Prop(Collection(chunter.class.ChatMessage), chunter.string.Comments)
    comments?: number
}

@Model(testManagement.class.TestRun, core.class.Doc, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestRun)
export class TTestRun extends TDoc implements TestRun {
  @Prop(TypeString(), testManagement.string.TestRunName)
  @Index(IndexKind.FullText)
    name!: string

  @Prop(TypeCollaborativeDoc(), testManagement.string.FullDescription)
  @Index(IndexKind.FullText)
    description!: CollaborativeDoc

  @Prop(TypeDate(DateRangeMode.DATETIME), testManagement.string.DueDate)
    dueDate?: Timestamp

  @Prop(Collection(testManagement.class.TestRunItem), testManagement.string.TestRunItems, {
    shortLabel: testManagement.string.TestRunItem
  })
    items?: CollectionSize<TestRunItem>
}

/** @public */
export function TypeTestRunResult (): Type<TestRunResult> {
  return { _class: testManagement.class.TypeTestRunResult, label: testManagement.string.TestRunResult }
}

@Model(testManagement.class.TypeTestRunResult, core.class.Type, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestRunResult)
export class TTypeTestRunResult extends TType {}

@Model(testManagement.class.TestRunItem, core.class.AttachedDoc, DOMAIN_TEST_MANAGEMENT)
@UX(testManagement.string.TestRunItem)
export class TTestRunItem extends TAttachedDoc implements TestRunItem {
  @Prop(TypeRef(testManagement.class.TestRun), testManagement.string.TestRun)
    testRun!: Ref<TestRun>

  @Prop(TypeRef(testManagement.class.TestCase), testManagement.string.TestCase)
    testCase!: Ref<TestCase>

  @Prop(TypeTestRunResult(), testManagement.string.TestRunResult)
    result?: TestRunResult

  @Prop(Collection(chunter.class.ChatMessage), chunter.string.Comments)
    comments?: number
}

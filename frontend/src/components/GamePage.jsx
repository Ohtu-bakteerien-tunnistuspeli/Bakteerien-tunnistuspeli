import { useState } from 'react'
import { Tabs, Tab, Form, Button, Table } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import { useSelector, useDispatch } from 'react-redux'
import { checkSamples, checkTests, checkBacterium } from '../reducers/gameReducer'
import ModalImage from './utility/ModalImage'
import FormattedText from './case/components/FormattedText'

const GamePage = () => {
    const library = useSelector(state => state.language)?.library?.frontend.gamePage
    const [tab, setTab] = useState('anamneesi')
    const [testTab, setTestTab] = useState('näytteitä')
    const dispatch = useDispatch()
    const game = useSelector(state => state.game)
    const user = useSelector(state => state.user)
    const bacteria = useSelector(state => state.bacteria)?.map(bact => bact.name)
    const [bacterium, setBacterium] = useState('')
    const [selectedSample, setSelectedSample] = useState('')
    const tests = useSelector(state => state.test)?.sort((test1, test2) => test1.name.localeCompare(test2.name))
    const testsToShow = tests.filter(test => test.type === 'Testi').sort((test1, test2) => test1.name.localeCompare(test2.name))
    const cultivationsToShow = tests.filter(test => test.type === 'Viljely').sort((test1, test2) => test1.name.localeCompare(test2.name))
    const stainingsToShow = tests.filter(test => test.type === 'Värjäys').sort((test1, test2) => test1.name.localeCompare(test2.name))
    const othersToShow = tests.filter(test => test.type !== 'Testi' && test.type !== 'Viljely' && test.type !== 'Värjäys').sort((test1, test2) => test1.name.localeCompare(test2.name))

    const sampleCheckBoxChange = (description) => {
        setSelectedSample(description)
    }

    const sampleSubmit = (event) => {
        event.preventDefault()
        if (selectedSample) {
            dispatch(checkSamples(game, selectedSample, user.token, setTestTab))
        }
    }

    const handleTest = (testId) => {
        if (!game.correctTests.includes(testId) && !game.allTestsDone) {
            dispatch(checkTests(game, testId, user.token, setTestTab))
        }
    }

    const bacteriumSubmit = (event) => {
        event.preventDefault()
        if (!game.bacteriumCorrect) {
            dispatch(checkBacterium(game, bacterium, user.token))
        }
    }

    return (
        <>
            <Tabs activeKey={tab} onSelect={(k) => setTab(k)}>
                <Tab eventKey='anamneesi' title={library.tabs.anamnesis}>
                    <p style={{ padding: '20px' }}><FormattedText value={game.case.anamnesis && game.case.anamnesis !== 'undefined' && game.case.anamnesis !== '<p>undefined</p>' ? game.case.anamnesis : ''} /></p>
                </Tab>
                <Tab eventKey='toiminnot' title={library.tabs.functions}>
                    <Tabs activeKey={testTab} onSelect={(k) => setTestTab(k)}>
                        <Tab eventKey='näytteitä' title={library.tabs.samples}>
                            <h1>{library.samplesTab.title}</h1>
                            <Form id='samples' onSubmit={(event) => sampleSubmit(event)}>
                                <Form.Label>{library.samplesTab.whatSample}</Form.Label>
                                {game.case.samples.map((sample, i) => <Form.Check key={i} type='radio' name='sample' label={sample.description} onChange={() => sampleCheckBoxChange(sample.description)} disabled={game.samplesCorrect && sample.description !== game.correctSample} defaultChecked={sample.description === game.correctSample ? 'checked' : ''} />)}
                                <Button
                                    variant='success'
                                    type='submit'
                                    id='checkSamples'
                                    className="game-margin"
                                    disabled={game.samplesCorrect}>
                                    {library.samplesTab.takeSample}
                                </Button>
                            </Form>
                        </Tab>
                        <Tab eventKey='testejä' title={library.tabs.tests} disabled={!game.samplesCorrect}>
                            <h1>{library.testsTab.title}</h1>
                            <div id='testView'>
                                {
                                    (cultivationsToShow && cultivationsToShow.length > 0) ?
                                        <>
                                            <h2 style={{ marginTop: '20px' }}>{library.testsTab.culture}</h2>
                                            {cultivationsToShow.map(test =>
                                                <Button id='testButton' key={test.id} variant='warning' style={{ margin: '3px' }} onClick={() => handleTest(test.id)}>{test.name}{game.correctTests.includes(test.id) ? <i className='fas fa-check'></i> : <></>}</Button>
                                            )}
                                        </>
                                        :
                                        <></>
                                }
                                {
                                    (testsToShow && testsToShow.length > 0) ?
                                        <>
                                            <h2 style={{ marginTop: '20px' }}>{library.testsTab.tests}</h2>
                                            {testsToShow.map(test =>
                                                <Button key={test.id} variant='info' style={{ margin: '3px' }} onClick={() => handleTest(test.id)}>{test.name}{game.correctTests.includes(test.id) ? <i className='fas fa-check'></i> : <></>}</Button>
                                            )}
                                        </>
                                        :
                                        <></>
                                }
                                {
                                    (stainingsToShow && stainingsToShow.length > 0) ?
                                        <>
                                            <h2 style={{ marginTop: '20px' }}>{library.testsTab.dye}</h2>
                                            {stainingsToShow.map(test =>
                                                <Button key={test.id} variant='success' style={{ margin: '3px' }} onClick={() => handleTest(test.id)}>{test.name}{game.correctTests.includes(test.id) ? <i className='fas fa-check'></i> : <></>}</Button>
                                            )}
                                        </>
                                        :
                                        <></>
                                }
                                {
                                    (othersToShow && othersToShow.length > 0) ?
                                        <>
                                            <h2 style={{ marginTop: '20px' }}>{library.testsTab.other}</h2>
                                            {othersToShow.map(test =>
                                                <Button key={test.id} variant='secondary' style={{ margin: '3px' }} onClick={() => handleTest(test.id)}>{test.name}{game.correctTests.includes(test.id) ? <i className='fas fa-check'></i> : <></>}</Button>
                                            )}
                                        </>
                                        :
                                        <></>
                                }
                            </div>
                        </Tab>
                        <Tab eventKey='tuloksia' title={library.tabs.results} disabled={!game.samplesCorrect}>
                            <h4 className="game-margin">{library.resultsTab.title}</h4>
                            <p className='instruct-img'>{library.resultsTab.imageInstruct}</p>
                            <Table id='resultTable'>
                                <thead>
                                    <tr>
                                        <th>{library.resultsTab.test}</th>
                                        <th>{library.resultsTab.controlImage}</th>
                                        <th>{library.resultsTab.result}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {game.testResults.map((result, i) =>
                                        <tr key={i}>
                                            <td>{result.testName}</td>
                                            <td>
                                                {tests.filter(test => test.name === result.testName).map(test =>
                                                    <div key={test.id}>
                                                        {test.controlImage ?
                                                            <ModalImage imageUrl={test.controlImage.url} width={'10%'} height={'10%'}></ModalImage>
                                                            :
                                                            <></>
                                                        }
                                                    </div>
                                                )}
                                            </td>
                                            {result.imageUrl ?
                                                <td><ModalImage imageUrl={result.imageUrl} width={'10%'} height={'10%'}></ModalImage></td>
                                                :
                                                <td></td>
                                            }
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Tab>
                    </Tabs>
                </Tab>
                <Tab eventKey='diagnoosi' title={library.tabs.diagnosis} disabled={!game.requiredTestsDone}>
                    <h1>{library.diagnosisTab.title}</h1>
                    {game.bacteriumCorrect ?
                        <>
                            <p style={{ padding: '10px' }}><FormattedText value={game.case.completionText ? game.case.completionText : ''} /></p>
                            {game.completionImageUrl ?
                                <>
                                    <p className='instruct-img'>{library.resultsTab.imageInstruct}</p>
                                    <ModalImage imageUrl={game.completionImageUrl} width={'10%'} height={'10%'}></ModalImage>
                                </>
                                :
                                <></>
                            }
                        </>
                        :
                        <>
                            <p>{library.diagnosisTab.insertDiagnosis}</p>
                            <Form onSubmit={(event) => bacteriumSubmit(event)}>
                                <Form.Group>
                                    <Form.Label>{library.diagnosisTab.insertBacterium}</Form.Label>
                                    <Typeahead
                                        id='type-ahead'
                                        inputProps={{ id: 'bacterium' }}
                                        value={bacterium}
                                        minLength={1}
                                        labelKey={option => option}
                                        onInputChange={(value) => setBacterium(value)}
                                        onChange={(options) => setBacterium(options[0])}
                                        filterBy={(option, props) => option.toLowerCase().startsWith(props.text.toLowerCase())}
                                        options={bacteria}
                                        emptyLabel={library.diagnosisTab.bacteriumNotFound}
                                    />
                                </Form.Group>
                                <Button variant='info'
                                    type='submit'
                                    id='checkDiagnosis'>
                                    {library.diagnosisTab.checkDiagnosis}
                                </Button>
                            </Form>
                        </>
                    }
                </Tab>
            </Tabs>
        </>
    )
}

export default GamePage
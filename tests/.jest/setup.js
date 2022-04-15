jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())

jest.mock('simple-output')
